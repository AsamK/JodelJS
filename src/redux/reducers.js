import {combineReducers} from "redux";
import merge from "lodash/merge";
import {RECEIVE_POSTS, SELECT_POST, SET_LOCATION, SWITCH_POST_LIST_CONTAINER_STATE, INVALIDATE_POSTS, PostListContainerStates} from "./actions";
//const {SHOW_ALL} = VisibilityFilters

/*let x = {
 entities: {
 posts: {
 "post_id1": {"POST"},
 "post_id2": {"POST"}
 }
 },
 postsLocation: {
 isFetching: false,
 didInvalidate: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 postsMine: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 postsMyResponses: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 postsMyVotes: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 },
 postsByChannel: {
 jedesmal: {
 isFetching: false,
 itemsRecent: ["post_id1", "post_id2"],
 itemsDiscussed: [],
 itemsPopular: []
 }
 }
 };
 */
function viewState(state = {
    selectedPostId: null,
    location: {latitude: undefined, longitude: undefined},
    postListContainerState: PostListContainerStates.RECENT
}, action) {
    switch (action.type) {
        case SELECT_POST:
            return Object.assign({}, state, {selectedPostId: action.postId});
        case SET_LOCATION:
            return Object.assign({}, state, {location: action.location});
        case SWITCH_POST_LIST_CONTAINER_STATE:
            return Object.assign({}, state, {postListContainerState: action.state});
        default:
            return state
    }
}

function entities(state = {}, action) {
    if (action.entities) {
        let newState = Object.assign({}, state);
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
            }
            if (action.postsLocationRecent != undefined) {
                newState.itemsRecent = action.postsLocationRecent;
            }
            if (action.postsLocationDiscussed != undefined) {
                newState.itemsDiscussed = action.postsLocationDiscussed;
            }
            if (action.postsLocationPopular != undefined) {
                newState.itemsPopular = action.postsLocationPopular;
            }
            return Object.assign({}, state, newState);
        case INVALIDATE_POSTS:
            return Object.assign({}, state, {didInvalidate: true});
        default:
            return state
    }
}

function postsLocation(state, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
            return posts(state, action);
        default:
            return posts(state, action);
    }
}

const JodelApp = combineReducers({
    entities,
    postsLocation,
    viewState,
});

export default JodelApp