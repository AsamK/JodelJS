import { combineReducers } from 'redux';

import type { IJodelAction } from '../../interfaces/IJodelAction';
import { INVALIDATE_POSTS, RECEIVE_POST, RECEIVE_POSTS, SET_IS_FETCHING } from '../actions/action.consts';

function uniq(a: string[]): string[] {
    const seen: { [key: string]: boolean } = {};
    return a.filter(item => Object.hasOwnProperty.call(seen, item) ? false : (seen[item] = true));
}

export interface IPostSection {
    readonly isFetching: boolean;
    readonly didInvalidate: boolean;
    readonly lastUpdated: number | null;
    readonly postsBySortType: IPostsBySortType;
}

export interface IPostsBySortType {
    readonly [key: string]: string[];
}

export interface IPostsBySectionStore {
    readonly [key: string]: IPostSection;
}

export function postsBySection(state: IPostsBySectionStore = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS:
        case INVALIDATE_POSTS:
        case SET_IS_FETCHING:
            return {
                ...state,
                [action.payload.section]: posts(state[action.payload.section], action),
            };
        default:
            return state;
    }
}

const posts = combineReducers<IPostSection>({
    didInvalidate,
    isFetching,
    lastUpdated,
    postsBySortType,
});

function isFetching(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POST:
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

function lastUpdated(state: number | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS:
            return !action.payload.append && action.receivedAt ? action.receivedAt : state;
        default:
            return state;
    }
}

function postsBySortType(state: IPostsBySortType = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS: {
            const newState: { [key: string]: string[] } = {};
            if (action.payload.append) {
                action.payload.postsBySortType.forEach(
                    p => newState[p.sortType] = uniq([...state[p.sortType], ...p.posts]));
            } else {
                action.payload.postsBySortType.forEach(p => newState[p.sortType] = p.posts);
            }
            return {
                ...state,
                ...newState,
            };
        }
        default:
            return state;
    }
}
