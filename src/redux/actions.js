import {
    apiGetAccessToken,
    apiGetPostsCombo,
    apiGetPost,
    apiUpVote,
    apiDownVote,
    apiAddPost,
    apiGetPostsMineCombo,
    apiGetPosts,
    apiGetKarma,
    apiGetPostsMineReplies,
    apiGetPostsMineVotes,
    apiGetConfig
} from "../app/api";
import crypto from "crypto";

/*
 * action types
 */
export const NEW_POSTS = 'NEW_POSTS';

/*
 * other constants
 */

export const PostListSortTypes = {
    RECENT: 'recent',
    DISCUSSED: 'discussed',
    POPULAR: 'popular'
};

/*
 * action creators
 */

export function upVote(postId, parentPostId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiUpVote(getState().account.token.access, postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post, parentPostId))
            }
        });
    }
}

export function downVote(postId, parentPostId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiDownVote(getState().account.token.access, postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post, parentPostId))
            }
        });
    }
}

export const SWITCH_POST_LIST_SORT_TYPE = 'SWITCH_POST_LIST_CONTAINER_STATE';
export function switchPostListSortType(sortType) {
    return {
        type: SWITCH_POST_LIST_SORT_TYPE,
        sortType
    }
}

export const SWITCH_POST_SECTION = 'SWITCH_POST_SECTION';
function _switchPostSection(section) {
    return {
        type: SWITCH_POST_SECTION,
        section,
    }
}

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

export const SHOW_ADD_POST = 'SHOW_ADD_POST';
export function showAddPost(visible, ancestor) {
    return {
        type: SHOW_ADD_POST,
        visible,
        ancestor,
    }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
function receivePosts(section, postsBySortType, append = false) {
    let res = {
        type: RECEIVE_POSTS,
        section,
        postsBySortType: [],
        entities: [],
        receivedAt: Date.now(),
        append
    };

    if (postsBySortType.recent !== undefined) {
        res.entities = res.entities.concat(postsBySortType.recent);
        res.postsBySortType.push({
            sortType: PostListSortTypes.RECENT,
            posts: postsBySortType.recent.map(post => post.post_id),
        });
    }
    if (postsBySortType.discussed !== undefined) {
        res.entities = res.entities.concat(postsBySortType.discussed);
        res.postsBySortType.push({
            sortType: PostListSortTypes.DISCUSSED,
            posts: postsBySortType.discussed.map(post => post.post_id),
        });
    }
    if (postsBySortType.popular !== undefined) {
        res.entities = res.entities.concat(postsBySortType.popular);
        res.postsBySortType.push({
            sortType: PostListSortTypes.POPULAR,
            posts: postsBySortType.popular.map(post => post.post_id),
        });
    }
    return res;
}

function receivePost(post, ancestor) {
    return {
        type: RECEIVE_POSTS,
        entities: [post],
        ancestor,
        receivedAt: Date.now()
    }
}

export const SELECT_POST = 'SELECT_POST';
function _selectPost(postId) {
    return {
        type: SELECT_POST,
        postId: postId,
        receivedAt: Date.now()
    }
}

export const SET_KARMA = 'SET_KARMA';
function _setKarma(karma) {
    return {
        type: SET_KARMA,
        karma,
        receivedAt: Date.now()
    }
}

export const SET_CONFIG = 'SET_CONFIG';
function _setConfig(config) {
    return {
        type: SET_CONFIG,
        config,
        receivedAt: Date.now()
    }
}

export const SET_DEVICE_UID = 'SET_DEVICE_UID';
function _setDeviceUID(deviceUid) {
    return {
        type: SET_DEVICE_UID,
        deviceUid,
    }
}

export const SET_TOKEN = 'SET_TOKEN';
function _setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType) {
    return {
        type: SET_TOKEN,
        distinctId,
        accessToken,
        refreshToken,
        expirationDate,
        tokenType,
    }
}

export const SET_LOCATION = 'SET_LOCATION';
function setLocation(latitude, longitude) {
    return {
        type: SET_LOCATION,
        location: {latitude: latitude, longitude: longitude, country: "DE"},
        receivedAt: Date.now()
    }
}

export const INVALIDATE_POSTS = 'INVALIDATE_POSTS';
function invalidatePosts(section) {
    return {
        section,
        type: INVALIDATE_POSTS,
    }
}

export const SET_IS_FETCHING = 'SET_IS_FETCHING';
function setIsFetching(section, isFetching = true) {
    return {
        section,
        isFetching,
        type: SET_IS_FETCHING,
    }
}

function shouldFetchPosts(section, state) {
    const posts = state.postsBySection[section];
    if (posts === undefined) {
        return true
    } else if (posts.isFetching) {
        return false
    } else {
        return posts.didInvalidate
    }
}

export function fetchPostsIfNeeded(section) {
    return (dispatch, getState) => {
        dispatch(getKarma());
        if (getState().viewState.selectedPostId != null) {
            dispatch(fetchPost(getState().viewState.selectedPostId));
        }

        if (section === undefined) {
            section = getState().viewState.postSection;
        }
        if (shouldFetchPosts(section, getState())) {
            dispatch(setIsFetching(section));
            switch (section) {
                case "location":
                    apiGetPostsCombo(getState().account.token.access, getState().viewState.location.latitude, getState().viewState.location.longitude, (err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, {
                                recent: res.body.recent,
                                discussed: res.body.replied,
                                popular: res.body.voted
                            }))
                        } else {
                            dispatch(setIsFetching(section, false));
                        }
                    });
                    break;
                case "mine":
                    apiGetPostsMineCombo(getState().account.token.access, (err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, {
                                recent: res.body.recent,
                                discussed: res.body.replied,
                                popular: res.body.voted
                            }))
                        } else {
                            dispatch(setIsFetching(section, false));
                        }
                    });
                    break;
                case "mineReplies":
                    apiGetPostsMineReplies(getState().account.token.access, (err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, {
                                recent: res.body.posts,
                            }))
                        } else {
                            dispatch(setIsFetching(section, false));
                        }
                    });
                    break;
                case "mineVotes":
                    apiGetPostsMineVotes(getState().account.token.access, undefined, undefined, (err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, {
                                recent: res.body.posts,
                            }))
                        } else {
                            dispatch(setIsFetching(section, false));
                        }
                    });
                    break;
            }
        }
    }
}

export function fetchMorePosts(section, sortType) {
    return (dispatch, getState) => {
        if (section === undefined) {
            section = getState().viewState.postSection;
        }
        if (sortType === undefined) {
            sortType = getState().viewState.postListSortType;
        }
        const postSection = getState().postsBySection[section];
        if (postSection === undefined || postSection.isFetching) {
            return;
        }
        const posts = postSection[sortType];
        let afterId;
        if (posts !== undefined) {
            afterId = posts[posts.length - 1];
        }
        switch (section) {
            case "location":
                dispatch(setIsFetching(section));
                apiGetPosts(getState().account.token.access, sortType, afterId, getState().viewState.location.latitude, getState().viewState.location.longitude, (err, res) => {
                    if (err == null && res != null) {
                        let p = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    } else {
                        dispatch(setIsFetching(section, false));
                    }
                });
                break;
            case "mine":
        }
    }
}

export function updatePosts() {
    return (dispatch, getState) => {
        const section = getState().viewState.postSection;
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    }
}

export function fetchPost(postId) {
    return (dispatch, getState) => {
        apiGetPost(getState().account.token.access, postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body))
            }
        });
    }
}

export function getKarma() {
    return (dispatch, getState) => {
        apiGetKarma(getState().account.token.access, (err, res) => {
            if (err == null && res != null) {
                dispatch(_setKarma(res.body.karma))
            }
        });
    }
}

export function getConfig() {
    return (dispatch, getState) => {
        apiGetConfig(getState().account.token.access, (err, res) => {
            if (err == null && res != null) {
                dispatch(_setConfig(res.body));
            }
        });
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

export function addPost(text, ancestor, color = "FF9908") {
    return (dispatch, getState) => {
        dispatch(showAddPost(false));
        let loc = getState().viewState.location;
        apiAddPost(getState().account.token.access, ancestor, color, 0.0, loc.latitude, loc.longitude, loc.city, loc.country, text, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePosts("location", {recent: res.body.posts}))
            }
            if (ancestor !== undefined) {
                dispatch(fetchPost(ancestor));
            }
        });
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

export function setDeviceUid(deviceUid) {
    return (dispatch, getState) => {
        const loc = getState().viewState.location;
        apiGetAccessToken(deviceUid, loc.latitude, loc.longitude, loc.city, loc.country, (err, res) => {
            if (err == null && res != null) {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(setToken(res.body.distinct_id, res.body.access_token, res.body.refresh_token, res.body.expiration_date, res.body.token_type));
            }
        });
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
