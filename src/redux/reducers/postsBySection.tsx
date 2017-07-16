import * as Immutable from 'immutable';
import {combineReducers} from 'redux';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INVALIDATE_POSTS, RECEIVE_POSTS, SET_IS_FETCHING, SWITCH_POST_SECTION} from '../actions';

function uniq(a) {
    const seen = {};
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

export interface IPostSection {
    isFetching: boolean
    didInvalidate: boolean
    lastUpdated: number
    postsBySortType: Immutable.Map<string, Immutable.List<string>>
}

export type IPostsBySectionStore = Immutable.Map<string, IPostSection>;

const posts = combineReducers<IPostSection>({
    isFetching,
    didInvalidate,
    lastUpdated,
    postsBySortType,
});

function isFetching(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        return false;
    case SET_IS_FETCHING:
        return action.payload.isFetching;
    default:
        return state;
    }
}

function didInvalidate(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        if (action.payload.append) {
            return state;
        }
        return false;
    case INVALIDATE_POSTS:
        return true;
    default:
        return state;
    }
}

function lastUpdated(state: number = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        return action.receivedAt;
    default:
        return state;
    }
}

function postsBySortType(state = Immutable.Map<string, Immutable.List<string>>({}), action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        let newState: any = {};
        if (action.payload.append) {
            action.payload.postsBySortType.forEach(p => newState[p.sortType] = uniq(state.get(p.sortType).concat(p.posts)));
        } else {
            newState.didInvalidate = false;
            newState.lastUpdated = action.receivedAt;
            action.payload.postsBySortType.forEach(p => newState[p.sortType] = Immutable.List<string>(p.posts));
        }
        return state.merge(newState);
    default:
        return state;
    }
}

export function postsBySection(state: IPostsBySectionStore = Immutable.Map<string, any>({}), action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
    case INVALIDATE_POSTS:
    case SET_IS_FETCHING:
        if (!action.payload.section) {
            return state;
        }
        return state.set(action.payload.section, posts(state.get(action.payload.section), action));
    default:
        return state;
    }
}
