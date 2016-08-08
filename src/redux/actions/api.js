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
    apiGetConfig,
    apiGetPostsMine,
    apiRefreshAccessToken,
    apiDeletePost
} from "../../app/api";
import {
    receivePost,
    setIsFetching,
    receivePosts,
    _setKarma,
    _setConfig,
    showAddPost,
    _setDeviceUID,
    PostListSortTypes
} from "./state";
import {setToken} from "../actions";

export function deletePost(postId) {
    return (dispatch, getState) => {
        apiDeletePost(getState().account.token.access, postId, (err, res) => {
            if (err == null && res != null) {
                console.log(res.body);
            }
        });
    }
}

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
                    apiGetPostsMineReplies(getState().account.token.access, undefined, undefined, (err, res) => {
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
        let skip, limit;
        switch (section) {
            case "location":
                let afterId;
                if (posts !== undefined) {
                    afterId = posts[posts.length - 1];
                }
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
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMine(getState().account.token.access, sortType, skip, limit, (err, res) => {
                    if (err == null && res != null) {
                        let p = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    } else {
                        dispatch(setIsFetching(section, false));
                    }
                });
                break;
            case "mineReplies":
                if (sortType != PostListSortTypes.RECENT) {
                    return;
                }
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMineReplies(getState().account.token.access, skip, limit, (err, res) => {
                    if (err == null && res != null) {
                        let p = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    } else {
                        dispatch(setIsFetching(section, false));
                    }
                });
                break;
            case "mineVotes":
                if (sortType != PostListSortTypes.RECENT) {
                    return;
                }
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMineVotes(getState().account.token.access, skip, limit, (err, res) => {
                    if (err == null && res != null) {
                        let p = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    } else {
                        dispatch(setIsFetching(section, false));
                    }
                });
                break;
        }
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

export function addPost(text, image, ancestor, color = "FF9908") {
    return (dispatch, getState) => {
        dispatch(showAddPost(false));
        let loc = getState().viewState.location;
        apiAddPost(getState().account.token.access, ancestor, color, 0.0, loc.latitude, loc.longitude, loc.city, loc.country, text, image, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePosts("location", {recent: res.body.posts}))
            }
            if (ancestor !== undefined) {
                dispatch(fetchPost(ancestor));
            }
        });
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

export function refreshAccessToken() {
    return (dispatch, getState) => {
        const account = getState().account;
        apiRefreshAccessToken(account.token.access, account.token.distinctId, account.token.refresh, (err, res) => {
            if (err == null && res !== null && res.body.upgraded === true) {
                dispatch(setToken(account.token.distinctId, res.body.access_token, account.token.refresh, res.body.expiration_date, res.body.token_type));
            }
        });
    }
}