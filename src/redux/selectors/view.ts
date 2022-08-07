import { createSelector } from 'reselect';

import type { IJodelAppStore } from '../reducers';

export const selectedSortTypeSelector = (state: IJodelAppStore) => state.viewState.postListSortType;

export const selectedSectionSelector = (state: IJodelAppStore) => state.viewState.postSection;

export const shareLinkSelector = (state: IJodelAppStore) => state.viewState.shareLink;

export const selectedHashtagNameSelector = createSelector(
    selectedSectionSelector,
    selectedSection =>
        !selectedSection || !selectedSection.startsWith('hashtag:')
            ? undefined
            : selectedSection.substring(8),
);

export const channelListVisibleSelector = (state: IJodelAppStore) =>
    state.viewState.channelList.visible;

export const settingsVisibleSelector = (state: IJodelAppStore) => state.viewState.settings.visible;

export const notificationsVisibleSelector = (state: IJodelAppStore) =>
    state.viewState.notifications.visible;

export const searchVisibleSelector = (state: IJodelAppStore) => state.viewState.search.visible;

export const addPostVisibleSelector = (state: IJodelAppStore) => state.viewState.addPost.visible;
