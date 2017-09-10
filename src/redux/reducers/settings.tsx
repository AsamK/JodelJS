import {combineReducers} from 'redux';

import {IJodelAction} from '../../interfaces/IJodelAction';
import {ILocation} from '../../interfaces/ILocation';
import {RECEIVE_POSTS, SET_LOCATION, SET_USE_BROWSER_LOCATION, SET_USE_HOME_LOCATION} from '../actions';

export const SETTINGS_VERSION = 1;

export function migrateSettings(storedState: ISettingsStore, oldVersion: number): ISettingsStore {
    if (storedState.location) {
        if (!storedState.location.latitude || !storedState.location.longitude) {
            storedState.location = null;
        }
    }
    return storedState;
}

export interface ISettingsStore {
    location: ILocation | null;
    useBrowserLocation: boolean;
    useHomeLocation: boolean;
    channelsLastRead: { [key: string]: number };
}

export const settings = combineReducers<ISettingsStore>({
    channelsLastRead,
    location,
    useBrowserLocation,
    useHomeLocation,
});

function location(state: ILocation | null = null, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_LOCATION:
            if (!action.payload || !action.payload.location) {
                return state;
            }
            return {...state, ...action.payload.location};
        default:
            return state;
    }
}

function useBrowserLocation(state = true, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_USE_BROWSER_LOCATION:
            if (!action.payload) {
                return state;
            }
            return action.payload.useBrowserLocation || false;
        default:
            return state;
    }
}

function useHomeLocation(state = false, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_USE_HOME_LOCATION:
            if (!action.payload) {
                return state;
            }
            return action.payload.useHomeLocation || false;
        default:
            return state;
    }
}

function channelsLastRead(state: { [key: string]: number } = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS:
            if (!action.payload) {
                return state;
            }
            if (!action.payload.append && action.payload.section !== undefined &&
                action.payload.section.startsWith('channel:')) {
                const channel = action.payload.section.substring(8);
                return {
                    ...state,
                    [channel]: action.receivedAt || 0,
                };
            }
            return state;
        default:
            return state;
    }
}
