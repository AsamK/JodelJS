import {combineReducers} from 'redux';

import {IJodelAction} from '../../interfaces/IJodelAction';
import {Section, SectionEnum} from '../../enums/Section';
import {
    REPLACE_VIEW_STATE,
    SELECT_PICTURE,
    SELECT_POST,
    SHOW_ADD_POST,
    SHOW_CHANNEL_LIST,
    SHOW_SETTINGS,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
} from '../actions';
import {PostListSortType} from '../../enums/PostListSortType';
import {SHOW_NOTIFICATIONS} from '../actions/state';

export interface IVisible {
    visible: boolean
}

export interface IViewStateStore {
    selectedPostId: string | null
    selectedPicturePostId: string | null
    postSection: Section
    postListSortType: PostListSortType
    addPost: IVisible
    settings: IVisible
    channelList: IVisible
    notifications: IVisible
}

export function viewState(state: IViewStateStore, action: IJodelAction): IViewStateStore {
    switch (action.type) {
    case REPLACE_VIEW_STATE:
        if (!action.payload) {
            return state;
        }
        return {...state, ...action.payload.newViewState};
    default:
        return viewStateCombined(state, action);
    }
}

const viewStateCombined = combineReducers<IViewStateStore>({
    selectedPostId,
    selectedPicturePostId,
    postSection,
    postListSortType,
    addPost,
    settings,
    channelList,
    notifications,
});

function selectedPostId(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case SELECT_POST:
        if (!action.payload) {
            return state;
        }
        return action.payload.postId || null;
    default:
        return state;
    }
}

function selectedPicturePostId(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case SELECT_PICTURE:
        if (!action.payload) {
            return state;
        }
        return action.payload.postId || null;
    default:
        return state;
    }
}

function postSection(state: Section = SectionEnum.LOCATION, action: IJodelAction): typeof state {
    switch (action.type) {
    case SWITCH_POST_SECTION:
        if (!action.payload) {
            return state;
        }
        return action.payload.section || SectionEnum.LOCATION;
    default:
        return state;
    }
}

function postListSortType(state = PostListSortType.RECENT, action: IJodelAction): typeof state {
    switch (action.type) {
    case SWITCH_POST_LIST_SORT_TYPE:
        if (!action.payload) {
            return state;
        }
        return action.payload.sortType || PostListSortType.RECENT;
    default:
        return state;
    }
}

function addPost(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_ADD_POST:
        if (!action.payload) {
            return state;
        }
        return {visible: action.payload.visible || false};
    default:
        return state;
    }
}

function settings(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_SETTINGS:
        if (!action.payload) {
            return state;
        }
        return {visible: action.payload.visible || false};
    default:
        return state;
    }
}

function channelList(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_CHANNEL_LIST:
        if (!action.payload) {
            return state;
        }
        return {visible: action.payload.visible || false};
    default:
        return state;
    }
}

function notifications(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_NOTIFICATIONS:
        if (!action.payload) {
            return state;
        }
        return {visible: action.payload.visible || false};
    default:
        return state;
    }
}
