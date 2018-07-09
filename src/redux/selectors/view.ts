import {createSelector} from 'reselect';

import {IJodelAppStore} from '../reducers';

export const getSelectedSortType = (state: IJodelAppStore) => state.viewState.postListSortType;

export const getSelectedSection = (state: IJodelAppStore) => state.viewState.postSection;

export const getShareLink = (state: IJodelAppStore) => state.viewState.shareLink;

export const getSelectedHashtagName = createSelector(
    getSelectedSection,
    selectedSection => !selectedSection || !selectedSection.startsWith('hashtag:')
        ? undefined : selectedSection.substring(8));

export const getChannelListVisible = (state: IJodelAppStore) => state.viewState.channelList.visible;

export const getSettingsVisible = (state: IJodelAppStore) => state.viewState.settings.visible;

export const getNotificationsVisible = (state: IJodelAppStore) => state.viewState.notifications.visible;

export const getSearchVisible = (state: IJodelAppStore) => state.viewState.search.visible;

export const getAddPostVisible = (state: IJodelAppStore) => state.viewState.addPost.visible;
