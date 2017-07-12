import * as crypto from 'crypto';
import {
    fetchPostsIfNeeded,
    getConfig,
    getFollowedChannelsMeta,
    getRecommendedChannels,
    setDeviceUid,
    setLocation,
    updatePost
} from './actions/api';
import {
    _selectPicture,
    _selectPost,
    _setPermissionDenied,
    _setToken,
    _showAddPost,
    _showChannelList,
    _showSettings,
    _switchPostListSortType,
    _switchPostSection,
    invalidatePosts,
    PostListSortTypes
} from './actions/state';
import {getLocation, IJodelAppStore} from './reducers';
import {ThunkAction} from 'redux-thunk';
import {IJodelAction} from '../interfaces/IJodelAction';
export * from './actions/state';
export * from './actions/api';

export function switchPostSection(section): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        if (getState().viewState.get('postSection') !== section) {
            dispatch(switchPostListSortType(PostListSortTypes.RECENT));
            dispatch(_switchPostSection(section));
        }
        dispatch(_selectPost(null));
        dispatch(_showChannelList(false));
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    };
}

export function switchPostListSortType(sortType): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        if (getState().viewState.get('postListSortType') !== sortType) {
            dispatch(_switchPostListSortType(sortType));
        }
    };
}

export function updatePosts(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const section = getState().viewState.get('postSection');
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    };
}

export function selectPost(postId): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        dispatch(_selectPost(postId));
        if (postId != null) {
            dispatch(updatePost(postId));
        }
    };
}

export function selectPicture(postId): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        dispatch(_selectPicture(postId));
    };
}

export function updateLocation(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        if (getState().settings.get('useBrowserLocation') && 'geolocation' in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(position => {
                let loc = getLocation(getState());
                if (loc.get('latitude') !== position.coords.latitude ||
                    loc.get('longitude') !== position.coords.longitude) {
                    dispatch(setLocation(position.coords.latitude, position.coords.longitude));
                    if (getState().account.token.access !== undefined) {
                        dispatch(updatePosts());
                    }
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
    };
}

export function setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        // TODO clear cached posts
        dispatch(_setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType));
        dispatch(getConfig());
        dispatch(updatePosts());
    };
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

export function createNewAccount(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const deviceUid = randomValueHex(32);
        dispatch(setDeviceUid(deviceUid));
    };
}

export function setPermissionDenied(permissionDenied): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let account = getState().account;
        if (account.deviceUid !== undefined && permissionDenied && !account.permissionDenied) {
            dispatch(_setPermissionDenied(permissionDenied));
            // Reregister
            dispatch(setDeviceUid(account.deviceUid));
        }
    };
}

export function showAddPost(visible): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        dispatch(_showAddPost(visible));
    };
}

export function showSettings(visible): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        dispatch(_showSettings(visible));
    };
}

export function showChannelList(visible): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        if (visible) {
            dispatch(getRecommendedChannels());
            dispatch(getFollowedChannelsMeta());
        }
        dispatch(_showChannelList(visible));
    };
}