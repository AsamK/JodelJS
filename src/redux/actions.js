import crypto from "crypto";
import {fetchPostsIfNeeded, fetchPost, getConfig, setDeviceUid, setLocation} from "./actions/api";
import {
    invalidatePosts,
    switchPostListSortType,
    _switchPostSection,
    _selectPost,
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
        if (getState().viewState.useBrowserLocation && "geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(position => {
                if (getState().viewState.location.latitude != position.coords.latitude &&
                    getState().viewState.location.longitude != position.coords.longitude) {
                    dispatch(setLocation(position.coords.latitude, position.coords.longitude));
                    dispatch(updatePosts());
                }
            }, err => {
                // TODO do something useful
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        break;
                    case err.POSITION_UNAVAILABLE:
                        break;
                    case err.TIMEOUT:
                        break;
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

// Gibt eine Zufallszahl zwischen min (inklusive) und max (exklusive) zurück
// Die Verwendung von Math.round() erzeugt keine gleichmäßige Verteilung!
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomValueHex(byteCount) {
    let rawBytes;
    try {
        rawBytes = crypto.randomBytes(byteCount);
    } catch (e) {
        // Old browser, insecure but works
        rawBytes = new Uint8Array(byteCount);
        rawBytes = rawBytes.map(i => getRandomInt(0, 256));
        rawBytes = Buffer.from(rawBytes);
    }
    return rawBytes.toString('hex'); // convert to hexadecimal format
}

export function createNewAccount() {
    return (dispatch, getState) => {
        const deviceUid = randomValueHex(32);
        dispatch(setDeviceUid(deviceUid));
    }
}
