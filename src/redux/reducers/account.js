import {SET_KARMA, SET_DEVICE_UID, SET_TOKEN, SET_CONFIG} from "../actions";

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
                distinctId: action.distinctId,
                token: {
                    access: action.accessToken,
                    refresh: action.refreshToken,
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
