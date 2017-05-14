import {SET_LOCATION, SET_USE_BROWSER_LOCATION, SET_USE_HOME_LOCATION, RECEIVE_POSTS} from '../actions';
import Immutable from 'immutable';

export const SETTINGS_VERSION = 1;
export function migrateSettings(storedState, oldVersion) {
    if (storedState.location.latitude === null) {
        storedState.location.latitude = undefined;
    }
    if (storedState.location.longitude === null) {
        storedState.location.longitude = undefined;
    }
    return storedState;
}

function settings(state = Immutable.Map({
    location: Immutable.Map({latitude: undefined, longitude: undefined, city: undefined, country: 'DE'}),
    useBrowserLocation: true,
    useHomeLocation: false,
    channelsLastRead: Immutable.Map(),
}), action) {
    switch (action.type) {
    case SET_LOCATION:
        return state.update('location', location => location.merge(action.location));
    case SET_USE_BROWSER_LOCATION:
        return state.set('useBrowserLocation', action.useBrowserLocation);
    case RECEIVE_POSTS:
        if (action.section !== undefined && action.section.startsWith('channel:')) {
            let channel = action.section.substring(8);
            return state.setIn(['channelsLastRead', channel], action.receivedAt);
        }
        return state;
    case SET_USE_HOME_LOCATION:
        return state.set('useHomeLocation', action.useHomeLocation);
    default:
        return state;
    }
}

export default settings;
