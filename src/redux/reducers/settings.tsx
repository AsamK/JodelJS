import {combineReducers} from 'redux';

import {IJodelAction} from '../../interfaces/IJodelAction';
import {ILocation} from '../../interfaces/ILocation';
import {RECEIVE_POSTS, SET_LOCATION, SET_USE_BROWSER_LOCATION, SET_USE_HOME_LOCATION} from '../actions';

export const SETTINGS_VERSION = 1;
export function migrateSettings(storedState: ISettingsStore, oldVersion: number): ISettingsStore {
    if (storedState.location) {
        if (storedState.location.latitude === null) {
            storedState.location.latitude = undefined;
        }
        if (storedState.location.longitude === null) {
            storedState.location.longitude = undefined;
        }
    }
    return storedState;
}

export interface ISettingsStore {
    location: ILocation | null
    useBrowserLocation: boolean
    useHomeLocation: boolean
    channelsLastRead: { [key: string]: number }
}

export const settings = combineReducers<ISettingsStore>({
    location,
    useBrowserLocation,
    useHomeLocation,
    channelsLastRead,
});

function location(state = null, action: IJodelAction): typeof state {
    switch (action.type) {
    case SET_LOCATION:
        return {...state, ...action.payload.location};
    default:
        return state;
    }
}

function useBrowserLocation(state = false, action: IJodelAction): typeof state {
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

function channelsLastRead(state: { [key: string]: number } = {}, action: IJodelAction): typeof state {
    switch (action.type) {
    case RECEIVE_POSTS:
        if (action.payload.section !== undefined && action.payload.section.startsWith('channel:')) {
            let channel = action.payload.section.substring(8);
            return {
                ...state,
                [channel]: action.receivedAt,
            };
        }
        return state;
    default:
        return state;
    }
}
