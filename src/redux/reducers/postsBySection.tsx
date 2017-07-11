import * as Immutable from 'immutable';
import {INVALIDATE_POSTS, RECEIVE_POSTS, SET_IS_FETCHING, SWITCH_POST_SECTION} from '../actions';

function uniq(a) {
    const seen = {};
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

function posts(state = Immutable.Map<string, any>({
    isFetching: false,
    didInvalidate: true,
    lastUpdated: null,
}), action) {
    switch (action.type) {
    case RECEIVE_POSTS:
        if (action.postsBySortType === undefined) {
            return state;
        }
        let newState: any = {
            isFetching: false,
        };
        if (action.append) {
            action.postsBySortType.forEach(p => newState[p.sortType] = uniq(state.get(p.sortType).concat(p.posts)));
        } else {
            newState.didInvalidate = false;
            newState.lastUpdated = action.receivedAt;
            action.postsBySortType.forEach(p => newState[p.sortType] = p.posts);
        }
        return state.merge(newState);
    case INVALIDATE_POSTS:
        return state.set('didInvalidate', true);
    case SET_IS_FETCHING:
        return state.set('isFetching', action.isFetching);
    default:
        return state;
    }
}

function postsBySection(state = Immutable.Map<string, any>({}), action) {
    if (action.section === undefined) {
        return state;
    }
    switch (action.type) {
    case RECEIVE_POSTS:
    case INVALIDATE_POSTS:
    case SWITCH_POST_SECTION:
    case SET_IS_FETCHING:
        return state.set(action.section, posts(state.get(action.section), action));
    default:
        return state;
    }
}

export default postsBySection;
