import crypto from "crypto";
import {fetchPostsIfNeeded, fetchPost, getConfig, setDeviceUid} from "./actions/api";
import {
    invalidatePosts,
    switchPostListSortType,
    _switchPostSection,
    _selectPost,
    setLocation,
    _setToken,
    PostListSortTypes
} from "./actions/state";
export * from "./actions/state";
export * from "./actions/api";

export function switchPostSection(section) {
    return (dispatch, getState) => {
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
        if (getState().viewState.postSection !== section) {
            dispatch(switchPostListSortType(PostListSortTypes.RECENT));
            dispatch(_switchPostSection(section));
        }
        dispatch(_selectPost(null));
    }
}

export function updatePosts() {
    return (dispatch, getState) => {
        const section = getState().viewState.postSection;
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    }
}

export function selectPost(postId) {
    return (dispatch, getState) => {
        dispatch(_selectPost(postId));
        if (postId != null) {
            dispatch(fetchPost(postId));
        }
    }
}

export function updateLocation() {
    return (dispatch, getState) => {
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(function (position) {
                if (getState().viewState.location.latitude != position.coords.latitude &&
                    getState().viewState.location.longitude != position.coords.longitude) {
                    dispatch(setLocation(position.coords.latitude, position.coords.longitude));
                    dispatch(updatePosts());
                }
            });
        }
    }
}

export function setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType) {
    return (dispatch, getState) => {
        // TODO clear cached posts
        dispatch(_setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType));
        dispatch(getConfig());
        dispatch(updatePosts());
    }
}

function randomValueHex(byteCount) {
    return crypto.randomBytes(byteCount)
        .toString('hex'); // convert to hexadecimal format
}

export function createNewAccount() {
    return (dispatch, getState) => {
        const deviceUid = randomValueHex(32);
        dispatch(setDeviceUid(deviceUid));
    }
}
