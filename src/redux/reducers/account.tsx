import {combineReducers} from 'redux';

import {IApiConfig} from '../../interfaces/IApiConfig';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {IToken} from '../../interfaces/IToken';
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
    return {...storedState, ...newState};
}

export type IAccountStore = Readonly<IAccountStoreMutable>;

interface IAccountStoreMutable {
    karma: number;
    deviceUid: string | null;
    token: IToken | null;
    refreshingToken: boolean;
    config: IApiConfig | null;
    permissionDenied: boolean;
    recommendedChannels: ReadonlyArray<string>;
    localChannels: ReadonlyArray<string>;
    countryChannels: ReadonlyArray<string>;
    suggestedHashtags: ReadonlyArray<string>;
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
        default:
            return state;
    }
}

function permissionDenied(state: boolean = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN:
            return false;
        case SET_PERMISSION_DENIED:
            return action.payload.permissionDenied;
        default:
            return state;
    }
}

function recommendedChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_RECOMMENDED_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function localChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_LOCAL_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function countryChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_COUNTRY_CHANNELS:
            return action.payload.entitiesChannels.map(c => c.channel);
        default:
            return state;
    }
}

function suggestedHashtags(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_SUGGESTED_HASHTAGS:
            return action.payload.suggestedHashtags;
        default:
            return state;
    }
}
