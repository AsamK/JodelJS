import { createSelector } from 'reselect';

import { IJodelAppStore } from '../reducers';
import { selectedChannelNameSelector } from './channels';
import { selectedPostIdSelector } from './posts';

export const deviceUidSelector = (state: IJodelAppStore) => state.account.deviceUid;

export const isConfigAvailableSelector = (state: IJodelAppStore) => !!state.account.config;

export const isRegisteredSelector = (state: IJodelAppStore) => !!state.account.token;

export const karmaSelector = (state: IJodelAppStore) => state.account.karma;

export const userAgeSelector = (state: IJodelAppStore) => !state.account.config ? null : state.account.config.age;

export const userTypeSelector = (state: IJodelAppStore) => !state.account.config ? null : state.account.config.user_type;

export const canChangeUserTypeSelector = (state: IJodelAppStore) =>
!state.account.config ? false : state.account.config.can_change_type;

export const specialPostColorsSelector = (state: IJodelAppStore) =>
    !state.account.config ? [] : state.account.config.special_post_colors;

export const addPostChannelSelector = createSelector(
    selectedPostIdSelector, selectedChannelNameSelector,
    (selectedPostId, selectedChannelName) => selectedPostId ? undefined : selectedChannelName,
);

export const locationSelector = (store: IJodelAppStore) => store.settings.location;

export const isLocationKnownSelector = (store: IJodelAppStore) => !!locationSelector(store);

export const toastsSelector = (state: IJodelAppStore) => state.toasts;

export const accessTokenSelector = (state: IJodelAppStore) => {
    if (!state.account.token) {
        return undefined;
    }
    return state.account.token.access;
};

export const isRefreshingTokenSelector = (state: IJodelAppStore) => state.account.refreshingToken;
