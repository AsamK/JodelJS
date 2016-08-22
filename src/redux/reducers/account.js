import {SET_KARMA, SET_DEVICE_UID, SET_TOKEN, SET_CONFIG, SET_PERMISSION_DENIED} from "../actions";

export const ACCOUNT_VERSION = 1;
export function migrateAccount(storedState, oldVersion) {
    storedState.permissionDenied = false;
    return storedState;
}

function account(state = {
    karma: 0,
    deviceUid: undefined,
    distinctId: undefined,
    token: undefined,
    config: undefined,
    permissionDenied: false,
}, action) {
    switch (action.type) {
        case SET_KARMA:
            return Object.assign({}, state, {karma: action.karma});
        case SET_DEVICE_UID:
            return Object.assign({}, state, {deviceUid: action.deviceUid});
        case SET_TOKEN:
            return Object.assign({}, state, {
                permissionDenied: false,
                token: {
                    distinctId: action.distinctId,
                    refresh: action.refreshToken,
                    access: action.accessToken,
                    expirationDate: action.expirationDate,
                    type: action.tokenType
                }
            });
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        case SET_PERMISSION_DENIED:
            return Object.assign({}, state, {permissionDenied: action.permissionDenied});
        default:
            return state;
    }
}

export default account;
