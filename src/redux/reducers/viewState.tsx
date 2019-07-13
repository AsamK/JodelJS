import { combineReducers } from 'redux';

import { PostListSortType } from '../../enums/PostListSortType';
import { Section, SectionEnum } from '../../enums/Section';
import { IJodelAction } from '../../interfaces/IJodelAction';
import {
    REPLACE_VIEW_STATE,
    SELECT_PICTURE,
    SELECT_POST,
    SHARE_LINK,
    SHARE_LINK_CLOSE,
    SHOW_ADD_POST,
    SHOW_CHANNEL_LIST,
    SHOW_NOTIFICATIONS,
    SHOW_SEARCH,
    SHOW_SETTINGS,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
} from '../actions/action.consts';

export interface IVisible {
    readonly visible: boolean;
}

export interface IViewStateStore {
    readonly selectedPostId: string | null;
    readonly selectedPicturePostId: string | null;
    readonly shareLink: string | null;
    readonly postSection: Section;
    readonly postListSortType: PostListSortType;
    readonly addPost: IVisible;
    readonly settings: IVisible;
    readonly channelList: IVisible;
    readonly notifications: IVisible;
    readonly search: IVisible;
}

export function viewState(state: IViewStateStore | undefined, action: IJodelAction): IViewStateStore {
    switch (action.type) {
        case REPLACE_VIEW_STATE:
            return { ...state, ...action.payload.newViewState };
        default:
            return viewStateCombined(state, action);
    }
}

const viewStateCombined = combineReducers<IViewStateStore>({
    addPost,
    channelList,
    notifications,
    postListSortType,
    postSection,
    search,
    selectedPicturePostId,
    selectedPostId,
    settings,
    shareLink,
});

function selectedPostId(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SELECT_POST:
            return action.payload.postId;
        default:
            return state;
    }
}

function selectedPicturePostId(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SELECT_PICTURE:
            return action.payload.postId;
        default:
            return state;
    }
}

function shareLink(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SHARE_LINK:
            return action.payload.link;
        case SHARE_LINK_CLOSE:
            return null;
        default:
            return state;
    }
}

function postSection(state: Section = SectionEnum.LOCATION, action: IJodelAction): typeof state {
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

function addPost(state: IVisible = { visible: false }, action: IJodelAction): typeof state {
    switch (action.type) {
        case SHOW_ADD_POST:
            return { visible: action.payload.visible };
        default:
            return state;
    }
}

function settings(state: IVisible = { visible: false }, action: IJodelAction): typeof state {
    switch (action.type) {
        case SWITCH_POST_SECTION:
            return { visible: false };
        case SELECT_POST:
            if (action.payload.postId) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_NOTIFICATIONS:
        case SHOW_CHANNEL_LIST:
        case SHOW_SEARCH:
            if (action.payload.visible) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_SETTINGS:
            return { visible: action.payload.visible };
        default:
            return state;
    }
}

function channelList(state: IVisible = { visible: false }, action: IJodelAction): typeof state {
    switch (action.type) {
        case SWITCH_POST_SECTION:
            return { visible: false };
        case SELECT_POST:
            if (action.payload.postId) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_NOTIFICATIONS:
        case SHOW_SEARCH:
        case SHOW_SETTINGS:
            if (action.payload.visible) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_CHANNEL_LIST:
            return { visible: action.payload.visible };
        default:
            return state;
    }
}

function notifications(state: IVisible = { visible: false }, action: IJodelAction): typeof state {
    switch (action.type) {
        case SWITCH_POST_SECTION:
            return { visible: false };
        case SELECT_POST:
            if (action.payload.postId) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_SEARCH:
        case SHOW_CHANNEL_LIST:
        case SHOW_SETTINGS:
            if (action.payload.visible) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_NOTIFICATIONS:
            return { visible: action.payload.visible };
        default:
            return state;
    }
}

function search(state: IVisible = { visible: false }, action: IJodelAction): typeof state {
    switch (action.type) {
        case SWITCH_POST_SECTION:
            return { visible: false };
        case SELECT_POST:
            if (action.payload.postId) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_NOTIFICATIONS:
        case SHOW_CHANNEL_LIST:
        case SHOW_SETTINGS:
            if (action.payload.visible) {
                return { visible: false };
            } else {
                return state;
            }
        case SHOW_SEARCH:
            return { visible: action.payload.visible };
        default:
            return state;
    }
}
