import {combineReducers} from 'redux';

import {IApiConfig} from '../../interfaces/IApiConfig';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {IToken} from '../../interfaces/IToken';
import {
    SET_CONFIG,
    SET_DEVICE_UID,
    SET_KARMA,
    SET_PERMISSION_DENIED,
    SET_RECOMMENDED_CHANNELS,
    SET_TOKEN,
} from '../actions';
import {SET_COUNTRY_CHANNELS, SET_LOCAL_CHANNELS, SET_SUGGESTED_HASHTAGS} from '../actions/state';

export const ACCOUNT_VERSION = 3;

export function migrateAccount(storedState: IAccountStore, oldVersion: number): IAccountStore {
    const newState: Partial<IAccountStoreMutable> = {};
    if (oldVersion < 2) {
        newState.recommendedChannels = [];
    }
    if (oldVersion < 3) {
        newState.localChannels = [];
    }
    return {...storedState, ...newState};
}

export type IAccountStore = Readonly<IAccountStoreMutable>;

interface IAccountStoreMutable {
    karma: number;
    deviceUid: string | null;
    token: IToken | null;
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
    suggestedHashtags,
    token,
});

function karma(state = 0, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_KARMA:
            if (!action.payload) {
                return state;
            }
            return action.payload.karma || 0;
        default:
            return state;
    }
}

function deviceUid(state: string | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_DEVICE_UID:
            if (!action.payload) {
                return state;
            }
            return action.payload.deviceUid || null;
        default:
            return state;
    }
}

function token(state: IToken | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN:
            if (!action.payload) {
                return state;
            }
            return action.payload.token || null;
        default:
            return state;
    }
}

function config(state: IApiConfig | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_CONFIG:
            if (!action.payload) {
                return state;
            }
            return action.payload.config || null;
        default:
            return state;
    }
}

function permissionDenied(state: boolean = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_TOKEN:
            return false;
        case SET_PERMISSION_DENIED:
            if (!action.payload) {
                return state;
            }
            return action.payload.permissionDenied || false;
        default:
            return state;
    }
}

function recommendedChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_RECOMMENDED_CHANNELS:
            if (!action.payload) {
                return state;
            }
            return action.payload.channelNames || [];
        default:
            return state;
    }
}

function localChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_LOCAL_CHANNELS:
            if (!action.payload) {
                return state;
            }
            return action.payload.channelNames || [];
        default:
            return state;
    }
}

function countryChannels(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_COUNTRY_CHANNELS:
            if (!action.payload) {
                return state;
            }
            return action.payload.channelNames || [];
        default:
            return state;
    }
}

function suggestedHashtags(state: ReadonlyArray<string> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_SUGGESTED_HASHTAGS:
            if (!action.payload) {
                return state;
            }
            return action.payload.suggestedHashtags || [];
        default:
            return state;
    }
}
