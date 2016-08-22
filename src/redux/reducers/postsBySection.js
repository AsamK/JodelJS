import {RECEIVE_POSTS, INVALIDATE_POSTS, SWITCH_POST_SECTION, SET_IS_FETCHING} from "../actions";

function uniq(a) {
    var seen = {};
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

function posts(state = {
    isFetching: false,
    didInvalidate: true,
    lastUpdated: null
}, action) {
    switch (action.type) {
        case RECEIVE_POSTS:
            if (action.postsBySortType === undefined) {
                return state;
            }
            let newState = {
                isFetching: false,
            };
            if (action.append) {
                action.postsBySortType.forEach(p => newState[p.sortType] = uniq(state[p.sortType].concat(p.posts)));
            } else {
                newState.didInvalidate = false;
                newState.lastUpdated = action.receivedAt;
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

export default postsBySection;
