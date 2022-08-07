import { combineReducers } from 'redux';

import type { IJodelAction } from '../../interfaces/IJodelAction';
import type { ILocation } from '../../interfaces/ILocation';
import { RECEIVE_POSTS, SET_LOCATION, SET_USE_BROWSER_LOCATION, SET_USE_HOME_LOCATION } from '../actions/action.consts';

export const SETTINGS_VERSION = 1;

export function migrateSettings(storedState: ISettingsStore, _oldVersion: number): ISettingsStore {
    if (storedState.location) {
        if (!storedState.location.latitude || !storedState.location.longitude) {
            return {
                ...storedState,
                location: null,
            };
        }
    }
    return storedState;
}

export interface ISettingsStore {
    readonly location: ILocation | null;
    readonly useBrowserLocation: boolean;
    readonly useHomeLocation: boolean;
    readonly channelsLastRead: { readonly [key: string]: number };
}

export const settings = combineReducers<ISettingsStore>({
    channelsLastRead,
    location,
    useBrowserLocation,
    useHomeLocation,
});

function location(state: Readonly<ILocation> | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_LOCATION:
            return { ...state, ...action.payload.location };
        default:
            return state;
    }
}

function useBrowserLocation(state = true, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_USE_BROWSER_LOCATION:
            return action.payload.useBrowserLocation;
        default:
            return state;
    }
}

function useHomeLocation(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_USE_HOME_LOCATION:
            return action.payload.useHomeLocation;
        default:
            return state;
    }
}

function channelsLastRead(state: { readonly [key: string]: number } = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS: {
            if (action.payload.append ||
                !action.payload.section.startsWith('channel:')) {
                return state;
            }
            const channel = action.payload.section.substring(8);
            return {
                ...state,
                [channel]: action.receivedAt,
            };
        }
        default:
            return state;
    }
}
