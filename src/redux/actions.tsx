import randomBytes from 'randombytes';

import { Buffer } from 'buffer';
import { PostListSortType } from '../enums/PostListSortType';
import { Section } from '../enums/Section';
import { TokenType } from '../enums/TokenType';
import { JodelThunkAction } from '../interfaces/JodelThunkAction';
import {
    fetchPostsIfNeeded,
    getConfig,
    getFollowedChannelsMeta,
    getKarma,
    getNotifications,
    getRecommendedChannels,
    getSuggestedHashtags,
    setDeviceUid,
    setLocation,
    setNotificationPostRead,
    updatePost,
} from './actions/api';
import {
    _selectPicture,
    _selectPost,
    _setPermissionDenied,
    _setToken,
    _showAddPost,
    _showChannelList,
    _showNotifications,
    _showSearch,
    _showSettings,
    _switchPostListSortType,
    _switchPostSection,
    invalidatePosts,
} from './actions/state';
import { locationSelector } from './selectors/app';

export * from './actions/state';
export * from './actions/api';

export function switchPostSection(section: Section): JodelThunkAction {
    return (dispatch, getState) => {
        if (getState().viewState.postSection !== section) {
            dispatch(switchPostListSortType(PostListSortType.RECENT));
        }
        dispatch(_switchPostSection(section));
        dispatch(_selectPost(null));
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    };
}

export function switchPostListSortType(sortType: PostListSortType): JodelThunkAction {
    return (dispatch, getState) => {
        if (getState().viewState.postListSortType !== sortType) {
            dispatch(_switchPostListSortType(sortType));
        }
    };
}

export function updatePosts(): JodelThunkAction {
    return (dispatch, getState) => {
        const section = getState().viewState.postSection;
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    };
}

export function selectPost(postId: string | null): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(_selectPost(postId));
        if (postId != null) {
            dispatch(updatePost(postId, true));
        }
    };
}

export function selectPostFromNotification(postId: string): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(setNotificationPostRead(postId));
        dispatch(_selectPost(postId));
        if (postId != null) {
            dispatch(updatePost(postId, true));
        }
    };
}

export function selectPicture(postId: string): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(_selectPicture(postId));
    };
}

export function updateLocation(): JodelThunkAction {
    return (dispatch, getState) => {
        if (getState().settings.useBrowserLocation && 'geolocation' in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(position => {

                const state = getState();
                const loc = locationSelector(state);
                const latitude = Math.round(position.coords.latitude * 100) / 100;
                const longitude = Math.round(position.coords.longitude * 100) / 100;
                if (!loc || loc.latitude !== latitude || loc.longitude !== longitude) {
                    dispatch(setLocation(latitude, longitude));
                    if (state.account.token && state.account.token.access !== undefined) {
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

export function setToken(distinctId: string, accessToken: string, refreshToken: string, expirationDate: number,
    tokenType: TokenType): JodelThunkAction {
    return (dispatch, getState) => {
        // TODO clear cached posts
        dispatch(_setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType));
        dispatch(getConfig());
        dispatch(updatePosts());
        dispatch(getNotifications());
        dispatch(getKarma());
    };
}

// Gibt eine Zufallszahl zwischen min (inklusive) und max (exklusive) zurück
// Die Verwendung von Math.round() erzeugt keine gleichmäßige Verteilung!
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomValueHex(byteCount: number) {
    let rawBytes: Buffer;
    try {
        rawBytes = randomBytes(byteCount);
    } catch (e) {
        // Old browser, insecure but works
        const byteArray = [];
        for (let i = 0; i < byteCount; ++i) {
            byteArray.push(getRandomInt(0, 256));
        }
        rawBytes = new Buffer(new Uint8Array(byteArray));
    }
    return rawBytes.toString('hex'); // convert to hexadecimal format
}

export function createNewAccount(): JodelThunkAction {
    return (dispatch, getState) => {
        const deviceUid = randomValueHex(32);
        dispatch(setDeviceUid(deviceUid));
    };
}

export function setPermissionDenied(permissionDenied: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        const account = getState().account;
        if (account.deviceUid && permissionDenied && !account.permissionDenied) {
            dispatch(_setPermissionDenied(permissionDenied));
        }
    };
}

export function showAddPost(visible: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(_showAddPost(visible));
    };
}

export function showSettings(visible: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(_showSettings(visible));
    };
}

export function showChannelList(visible: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        if (visible) {
            dispatch(getRecommendedChannels());
            dispatch(getFollowedChannelsMeta());
        }
        dispatch(_showChannelList(visible));
    };
}

export function showNotifications(visible: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(_showNotifications(visible));
    };
}

export function showSearch(visible: boolean): JodelThunkAction {
    return (dispatch, getState) => {
        dispatch(getSuggestedHashtags());
        dispatch(_showSearch(visible));
    };
}
