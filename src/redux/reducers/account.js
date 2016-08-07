import {SET_KARMA, SET_DEVICE_UID, SET_TOKEN, SET_CONFIG} from "../actions";

export const ACCOUNT_VERSION = 1;
export function migrateAccount(storedState, oldVersion) {
    return storedState;
}

function account(state = {
    karma: 0,
    deviceUid: undefined,
    distinctId: undefined,
    token: undefined,
    config: undefined,
}, action) {
    switch (action.type) {
        case SET_KARMA:
            return Object.assign({}, state, {karma: action.karma});
        case SET_DEVICE_UID:
            return Object.assign({}, state, {deviceUid: action.deviceUid});
        case SET_TOKEN:
            return Object.assign({}, state, {
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
        default:
            return state;
    }
}

export default account;
