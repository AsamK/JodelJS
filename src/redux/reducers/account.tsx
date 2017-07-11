import * as Immutable from 'immutable';
import {
    SET_CONFIG,
    SET_DEVICE_UID,
    SET_KARMA,
    SET_PERMISSION_DENIED,
    SET_RECOMMENDED_CHANNELS,
    SET_TOKEN
} from '../actions';

export const ACCOUNT_VERSION = 3;
export function migrateAccount(storedState, oldVersion) {
    storedState.permissionDenied = false;
    if (oldVersion < 2) {
        storedState.recommendedChannels = Immutable.List();
    }
    if (oldVersion < 3) {
        storedState.localChannels = Immutable.List();
    }
    return storedState;
}

function account(state = Immutable.Map<string, any>({
    karma: 0,
    deviceUid: undefined,
    distinctId: undefined,
    token: undefined,
    config: undefined,
    permissionDenied: false,
    recommendedChannels: Immutable.List(),
    localChannels: Immutable.List(),
}), action) {
    switch (action.type) {
    case SET_KARMA:
        return state.set('karma', action.karma);
    case SET_DEVICE_UID:
        return state.set('deviceUid', action.deviceUid);
    case SET_TOKEN:
        return state.merge({
            permissionDenied: false,
            token: {
                distinctId: action.distinctId,
                refresh: action.refreshToken,
                access: action.accessToken,
                expirationDate: action.expirationDate,
                type: action.tokenType,
            },
        });
    case SET_CONFIG:
        return state.set('config', Immutable.fromJS(action.config));
    case SET_PERMISSION_DENIED:
        return state.set('permissionDenied', action.permissionDenied);
    case SET_RECOMMENDED_CHANNELS:
        return state.set('recommendedChannels', Immutable.List(action.recommendedChannels.map(c => c.channel)))
            .set('localChannels', Immutable.List(action.localChannels.map(c => c.channel)));
    default:
        return state;
    }
}

export default account;
