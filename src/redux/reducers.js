import {combineReducers} from "redux";
import {
    RECEIVE_POSTS,
    SELECT_POST,
    SET_LOCATION,
    SWITCH_POST_LIST_SORT_TYPE,
    INVALIDATE_POSTS,
    SWITCH_POST_SECTION,
    PostListSortTypes,
    SHOW_ADD_POST,
    SET_IS_FETCHING,
    SET_KARMA,
    SET_DEVICE_UID,
    SET_TOKEN,
    SET_CONFIG
} from "./actions";

export const VIEW_STATE_VERSION = 2;
export function migrateViewState(storedState, oldVersion) {
    if (oldVersion < 2) {
        storedState.location.country = "DE";
    }
    return storedState;
}

function viewState(state = {
    selectedPostId: null,
    location: {latitude: undefined, longitude: undefined, city: undefined, country: "DE"},
    postSection: "location",
    postListSortType: PostListSortTypes.RECENT,
    addPost: {visible: false, ancestor: undefined},
}, action) {
    switch (action.type) {
        case SELECT_POST:
            return Object.assign({}, state, {selectedPostId: action.postId});
        case SET_LOCATION:
            return Object.assign({}, state, {location: action.location});
        case SWITCH_POST_LIST_SORT_TYPE:
            return Object.assign({}, state, {postListSortType: action.sortType});
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

function uniq(a) {
    var seen = {};
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

function posts(state = {
    isFetching: false,
    didInvalidate: true,
    lastUpdates: null
}, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
            if (action.postsBySortType === undefined) {
                return state;
            }
            let newState = {
                isFetching: false,
                lastUpdated: action.receivedAt,
            };
            if (action.append) {
                action.postsBySortType.forEach(p => newState[p.sortType] = uniq(state[p.sortType].concat(p.posts)));
            } else {
                newState.didInvalidate = false;
                action.postsBySortType.forEach(p => newState[p.sortType] = p.posts);
            }
            return Object.assign({}, state, newState);
        case INVALIDATE_POSTS:
            return Object.assign({}, state, {didInvalidate: true});
        case SET_IS_FETCHING:
            return Object.assign({}, state, {isFetching: action.isFetching});
        default:
            return state
    }
}

function postsBySection(state = {}, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
        case INVALIDATE_POSTS:
        case SWITCH_POST_SECTION:
        case SET_IS_FETCHING:
            let newState = {};
            newState[action.section] = posts(state[action.section], action);
            return Object.assign({}, state, newState);
        default:
            return state;
    }
}

function account(state = {
    karma: 0,
    deviceUid: undefined,
    distinctId: undefined,
    token: undefined,
    config: undefined,
}, action) {
    switch (action.type) {
        case SET_KARMA:
            return Object.assign({}, state, {karma: action.karma});
        case SET_DEVICE_UID:
            return Object.assign({}, state, {deviceUid: action.deviceUid});
        case SET_TOKEN:
            console.log(action);
            return Object.assign({}, state, {
                distinctId: action.distinctId,
                token: {
                    access: action.accessToken,
                    refresh: action.refreshToken,
                    expirationDate: action.expirationDate,
                    type: action.tokenType
                }
            });
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        default:
            return state;
    }
}

const JodelApp = combineReducers({
    entities,
    postsBySection,
    viewState,
    account,
});

export default JodelApp;
