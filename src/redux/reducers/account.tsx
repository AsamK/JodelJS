import { combineReducers } from 'redux';

import type { IApiConfig } from '../../interfaces/IApiConfig';
import type { IJodelAction } from '../../interfaces/IJodelAction';
import type { IToken } from '../../interfaces/IToken';
import {
    SET_CONFIG,
    SET_COUNTRY_CHANNELS,
    SET_DEVICE_UID,
    SET_KARMA,
    SET_LOCAL_CHANNELS,
    SET_PERMISSION_DENIED,
    SET_RECOMMENDED_CHANNELS,
    SET_SUGGESTED_HASHTAGS,
    SET_TOKEN,
    SET_TOKEN_PENDING,
    SET_USER_TYPE_RESPONSE,
} from '../actions/action.consts';

export const ACCOUNT_VERSION = 3;

export function migrateAccount(storedState: IAccountStore, oldVersion: number): IAccountStore {
    const newState: Partial<IAccountStoreMutable> = {};
    if (oldVersion < 2) {
        newState.recommendedChannels = [];
    }
    if (oldVersion < 3) {
        newState.localChannels = [];
    }
    newState.refreshingToken = false;
    return { ...storedState, ...newState };
}

export type IAccountStore = Readonly<IAccountStoreMutable>;

interface IAccountStoreMutable {
    karma: number;
    deviceUid: string | null;
    token: IToken | null;
    refreshingToken: boolean;
    config: IApiConfig | null;
    permissionDenied: boolean;
    recommendedChannels: readonly string[];
    localChannels: readonly string[];
    countryChannels: readonly string[];
    suggestedHashtags: readonly string[];
}

export const account = combineReducers<IAccountStore>({
    config,
    countryChannels,
    deviceUid,
    karma,
    localChannels,
    permissionDenied,
    recommendedChannels,
    refreshingToken,
    suggestedHashtags,
    token,
});

function karma(state = 0, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_KARMA:
            return action.payload.karma;
        default:
            return state;
    }
}

function deviceUid(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_DEVICE_UID:
            return action.payload.deviceUid;
        default:
            return state;
    }
}

function token(state: IToken | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN:
            return action.payload.token;
        default:
            return state;
    }
}

function refreshingToken(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN_PENDING:
            return true;
        case SET_TOKEN:
            return false;
        default:
            return state;
    }
}

function config(state: IApiConfig | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_CONFIG:
            return action.payload.config;
        case SET_USER_TYPE_RESPONSE:
            if (!state) {
                return state;
            }

            return {
                ...state,
                can_change_type: false,
                user_type: action.payload.userType,
            };
        default:
            return state;
    }
}

function permissionDenied(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN:
            return false;
        case SET_PERMISSION_DENIED:
            return action.payload.permissionDenied;
        default:
            return state;
    }
}

function recommendedChannels(state: readonly string[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_RECOMMENDED_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function localChannels(state: readonly string[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_LOCAL_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function countryChannels(state: readonly string[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_COUNTRY_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function suggestedHashtags(state: readonly string[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_SUGGESTED_HASHTAGS:
            return action.payload.suggestedHashtags;
        default:
            return state;
    }
}
