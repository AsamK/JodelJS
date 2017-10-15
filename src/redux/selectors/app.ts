import {createSelector} from 'reselect';

import {IJodelAppStore} from '../reducers';
import {getSelectedChannelName} from './channels';
import {getSelectedPostId} from './posts';

export const getDeviceUid = (state: IJodelAppStore) => state.account.deviceUid;

export const getIsConfigAvailable = (state: IJodelAppStore) => !!state.account.config;

export const getIsRegistered = (state: IJodelAppStore) => !!state.account.token;

export const getKarma = (state: IJodelAppStore) => state.account.karma;

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
