import {combineReducers} from 'redux';

import {IJodelAction} from '../../interfaces/IJodelAction';
import {Section, SectionEnum} from '../../interfaces/Section';
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
import {PostListSortType} from '../../interfaces/PostListSortType';

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
}

export function viewState(state: IViewStateStore, action: IJodelAction): IViewStateStore {
    switch (action.type) {
    case REPLACE_VIEW_STATE:
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
});

function selectedPostId(state: string = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case SELECT_POST:
        return action.payload.postId;
    default:
        return state;
    }
}

function selectedPicturePostId(state: string = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case SELECT_PICTURE:
        return action.payload.postId;
    default:
        return state;
    }
}

function postSection(state = SectionEnum.LOCATION, action: IJodelAction): typeof state {
    switch (action.type) {
    case SWITCH_POST_SECTION:
        return action.payload.section;
    default:
        return state;
    }
}

function postListSortType(state = PostListSortType.RECENT, action: IJodelAction): typeof state {
    switch (action.type) {
    case SWITCH_POST_LIST_SORT_TYPE:
        return action.payload.sortType;
    default:
        return state;
    }
}

function addPost(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_ADD_POST:
        return {visible: action.payload.visible};
    default:
        return state;
    }
}

function settings(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_SETTINGS:
        return {visible: action.payload.visible};
    default:
        return state;
    }
}

function channelList(state: IVisible = {visible: false}, action: IJodelAction): typeof state {
    switch (action.type) {
    case SHOW_CHANNEL_LIST:
        return {visible: action.payload.visible};
    default:
        return state;
    }
}
