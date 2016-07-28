import {combineReducers} from "redux";
import {
    RECEIVE_POSTS,
    SELECT_POST,
    SET_LOCATION,
    SWITCH_POST_LIST_CONTAINER_STATE,
    INVALIDATE_POSTS,
    SWITCH_POST_SECTION,
    PostListContainerStates,
    SHOW_ADD_POST
} from "./actions";
//const {SHOW_ALL} = VisibilityFilters

/*let x = {
 entities: {
 posts: {
 "post_id1": {"POST"},
 "post_id2": {"POST"}
 }
 },
 postsBySection: {
 location: {
 isFetching: false,
 didInvalidate: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 mine: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 myResponses: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 myVotes: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 channel_jhj: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 }
 };
 */
function viewState(state = {
    selectedPostId: null,
    location: {latitude: undefined, longitude: undefined},
    postSection: "location",
    postListContainerState: PostListContainerStates.RECENT,
    addPost: {visible: false, ancestor: undefined},
}, action) {
    switch (action.type) {
        case SELECT_POST:
            return Object.assign({}, state, {selectedPostId: action.postId});
        case SET_LOCATION:
            return Object.assign({}, state, {location: action.location});
        case SWITCH_POST_LIST_CONTAINER_STATE:
            return Object.assign({}, state, {postListContainerState: action.state});
        case SWITCH_POST_SECTION:
            return Object.assign({}, state, {postSection: action.section});
        case SHOW_ADD_POST:
            return Object.assign({}, state, {addPost: {visible: action.visible, ancestor: action.ancestor}});
        default:
            return state
    }
}

function entities(state = {}, action) {
    if (action.entities) {
        let newState = Object.assign({}, state);
        if (action.ancestor != undefined) {
            // We get child items, replace children, but don't add new ones, which shouldn't happen anyway
            let parent = Object.assign({}, state[action.ancestor]);
            action.entities.forEach((post) => {
                parent.children = parent.children.map(child => child.post_id === post.post_id ? post : child);
            });
            newState[action.ancestor] = parent;
        } else {
            action.entities.forEach((post) => {
                if (newState.hasOwnProperty(post.post_id)) {
                    const oldPost = newState[post.post_id];
                    if (oldPost.children != undefined && post.children != undefined && post.children.length == 0) {
                        // The old post has children and the new post has children, which however aren't included in the new data
                        // -> keep old children
                        post.children = oldPost.children;
                        post.child_count = oldPost.child_count;
                    }
                }
                newState[post.post_id] = post;
            });
        }
        return newState;
    }
    return state;
}

function posts(state = {
    isFetching: false,
    didInvalidate: true,
    itemsRecent: [],
    itemsDiscussed: [],
    itemsPopular: [],
    lastUpdates: null
}, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
            let newState = {
                isFetching: false,
                didInvalidate: false,
                lastUpdated: action.receivedAt
            };
            if (action.postsRecent != undefined) {
                newState.itemsRecent = action.postsRecent;
            }
            if (action.postsDiscussed != undefined) {
                newState.itemsDiscussed = action.postsDiscussed;
            }
            if (action.postsPopular != undefined) {
                newState.itemsPopular = action.postsPopular;
            }
            return Object.assign({}, state, newState);
        case INVALIDATE_POSTS:
            return Object.assign({}, state, {didInvalidate: true});
        default:
            return state
    }
}

function postsBySection(state = {}, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
        case INVALIDATE_POSTS:
        case SWITCH_POST_SECTION:
            let newState = {};
            newState[action.section] = posts(state[action.section], action);
            return Object.assign({}, state, newState);
        default:
            return state;
    }
}

const JodelApp = combineReducers({
    entities,
    postsBySection,
    viewState,
});

export default JodelApp