import {combineReducers} from 'redux';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INVALIDATE_POSTS, RECEIVE_POSTS, SET_IS_FETCHING} from '../actions';

function uniq(a: string[]): string[] {
    const seen = {};
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

export interface IPostSection {
    isFetching: boolean
    didInvalidate: boolean
    lastUpdated: number
    postsBySortType: IPostsBySortType
}

export type IPostsBySortType = { [key: string]: Array<string> }

export type IPostsBySectionStore = { [key: string]: IPostSection };

export function postsBySection(state: IPostsBySectionStore = {}, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
    case INVALIDATE_POSTS:
    case SET_IS_FETCHING:
        if (!action.payload.section) {
            return state;
        }
        return {
            ...state,
            [action.payload.section]: posts(state[action.payload.section], action),
        };
    default:
        return state;
    }
}

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

function postsBySortType(state: IPostsBySortType = {}, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        let newState: typeof state = {};
        if (action.payload.append) {
            action.payload.postsBySortType.forEach(p => newState[p.sortType] = uniq([...state[p.sortType], ...p.posts]));
        } else {
            action.payload.postsBySortType.forEach(p => newState[p.sortType] = p.posts);
        }
        return {
            ...state,
            ...newState,
        };
    default:
        return state;
    }
}
