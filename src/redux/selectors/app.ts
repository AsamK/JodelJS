import { createSelector } from 'reselect';

import { IJodelAppStore } from '../reducers';
import { getSelectedChannelName } from './channels';
import { getSelectedPostId } from './posts';

export const getDeviceUid = (state: IJodelAppStore) => state.account.deviceUid;

export const getIsConfigAvailable = (state: IJodelAppStore) => !!state.account.config;

export const getIsRegistered = (state: IJodelAppStore) => !!state.account.token;

export const getKarma = (state: IJodelAppStore) => state.account.karma;

export const getAge = (state: IJodelAppStore) => !state.account.config ? null : state.account.config.age;

export const getUserType = (state: IJodelAppStore) => !state.account.config ? null : state.account.config.user_type;

export const canChangeUserType = (state: IJodelAppStore) =>
!state.account.config ? false : state.account.config.can_change_type;

export const getSpecialPostColors = (state: IJodelAppStore) =>
    !state.account.config ? [] : state.account.config.special_post_colors;

export const getAddPostChannel = createSelector(
    getSelectedPostId, getSelectedChannelName,
    (selectedPostId, selectedChannelName) => selectedPostId ? undefined : selectedChannelName,
);

export const getLocation = (store: IJodelAppStore) => store.settings.location;

export const isLocationKnown = (store: IJodelAppStore) => !!getLocation(store);

export const getToasts = (state: IJodelAppStore) => state.toasts;

export const getAccessToken = (state: IJodelAppStore) => {
    if (!state.account.token) {
        return undefined;
    }
    return state.account.token.access;
};

export const getIsRefreshingToken = (state: IJodelAppStore) => state.account.refreshingToken;
