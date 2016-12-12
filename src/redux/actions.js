import crypto from "crypto";
import {
    fetchPostsIfNeeded,
    fetchPost,
    getConfig,
    setDeviceUid,
    setLocation,
    getRecommendedChannels,
    getFollowedChannelsMeta
} from "./actions/api";
import {
    invalidatePosts,
    _switchPostListSortType,
    _switchPostSection,
    _selectPost,
    _setToken,
    PostListSortTypes,
    _setPermissionDenied,
    _showChannelList,
    _selectPicture,
    _showSettings,
    _showAddPost
} from "./actions/state";
import {getLocation} from "./reducers";
export * from "./actions/state";
export * from "./actions/api";

export function switchPostSection(section, nohistory = false) {
    return (dispatch, getState) => {
        if (getState().viewState.get("postSection") !== section) {
            dispatch(switchPostListSortType(PostListSortTypes.RECENT, true));
            dispatch(_switchPostSection(section));
            if (!nohistory) {
                history.pushState({postSection: section, postListSortType: PostListSortTypes.RECENT}, "");
            }
        }
        dispatch(_selectPost(null));
        dispatch(_showChannelList(false));
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    }
}

export function switchPostListSortType(sortType, nohistory = false) {
    return (dispatch, getState) => {
        if (getState().viewState.get("postListSortType") !== sortType) {
            dispatch(_switchPostListSortType(sortType));
            if (!nohistory) {
                history.replaceState(Object.assign(history.state, {postListSortType: sortType}), "");
            }
        }
    }
}

export function updatePosts() {
    return (dispatch, getState) => {
        const section = getState().viewState.get("postSection");
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    }
}

export function selectPost(postId, nohistory = false) {
    return (dispatch, getState) => {
        if (postId != null && !nohistory && getState().viewState.get("selectedPostId") !== postId) {
            history.pushState({selectedPostId: postId}, "");
        }
        dispatch(_selectPost(postId));
        if (postId != null) {
            dispatch(fetchPost(postId));
        }
    }
}

export function selectPicture(postId, nohistory = false) {
    return (dispatch, getState) => {
        if (postId != null && !nohistory && getState().viewState.get("selectedPicturePostId") !== postId) {
            history.pushState({selectedPicturePostId: postId}, "");
        }
        dispatch(_selectPicture(postId));
    }
}

export function updateLocation() {
    return (dispatch, getState) => {
        if (getState().viewState.get("useBrowserLocation") && "geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(position => {
                let loc = getLocation(getState());
                if (location.get("latitude") !== position.coords.latitude ||
                    location.get("longitude") !== position.coords.longitude) {
                    dispatch(setLocation(position.coords.latitude, position.coords.longitude));
                    if (getState().account.getIn(["token", "access"]) !== undefined) {
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

export function setPermissionDenied(permissionDenied) {
    return (dispatch, getState) => {
        let account = getState().account;
        if (account.get("deviceUid") !== undefined && permissionDenied && !account.get("permissionDenied")) {
            dispatch(_setPermissionDenied(permissionDenied));
            // Reregister
            dispatch(setDeviceUid(account.get("deviceUid")));
        }
    }
}

export function showAddPost(visible, nohistory = false) {
    return (dispatch, getState) => {
        if (visible && !nohistory && getState().viewState.getIn(["addPost", "visible"]) !== visible) {
            history.pushState({addPostVisible: visible}, "");
        }
        dispatch(_showAddPost(visible));
    }
}

export function showSettings(visible, nohistory = false) {
    return (dispatch, getState) => {
        if (visible && !nohistory && getState().viewState.getIn(["settings", "visible"]) !== visible) {
            history.pushState({settingsVisible: visible}, "");
        }
        dispatch(_showSettings(visible));
    }
}

export function showChannelList(visible, nohistory = false) {
    return (dispatch, getState) => {
        if (visible) {
            if (!nohistory && getState().viewState.getIn(["channelList", "visible"]) !== visible) {
                history.pushState({channelListVisible: visible}, "");
            }
            dispatch(getRecommendedChannels());
            dispatch(getFollowedChannelsMeta());
        }
        dispatch(_showChannelList(visible));
    }
}