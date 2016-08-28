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
    apiDeletePost,
    apiSetPlace,
    apiGetPostsChannelCombo,
    apiGetPostsChannel,
    apiPin,
    apiUnpin,
    apiGetPostsMinePinned
} from "../../app/api";
import {
    receivePost,
    setIsFetching,
    receivePosts,
    _setKarma,
    _setConfig,
    showAddPost,
    _setDeviceUID,
    PostListSortTypes,
    _setLocation,
    pinnedPost
} from "./state";
import {setToken, setPermissionDenied, updatePosts} from "../actions";

function handlePermissionDenied(dispatch, getState, err) {
    if (err.status === 401) {
        console.error("Permission denied, reregistering…");
        dispatch(setPermissionDenied(true));
    }
}
export function deletePost(postId) {
    return (dispatch, getState) => {
        apiDeletePost(getState().account.getIn(["token", "access"]), postId)
            .then(res => dispatch(updatePosts()))
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function upVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiUpVote(getState().account.getIn(["token", "access"]), postId)
            .then(res => dispatch(receivePost(res.body.post)))
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function downVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiDownVote(getState().account.getIn(["token", "access"]), postId)
            .then(res => dispatch(receivePost(res.body.post)))
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function pin(postId, pinned = true) {
    return (dispatch, getState) => {
        let fn;
        if (pinned) {
            fn = apiPin;
        } else {
            fn = apiUnpin;
        }
        fn(getState().account.getIn(["token", "access"]), postId)
            .then(res => {
                dispatch(pinnedPost(postId, pinned, res.body.pin_count))
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

function shouldFetchPosts(section, state) {
    const posts = state.postsBySection.get(section);
    if (posts === undefined) {
        return true;
    } else if (posts.get("isFetching")) {
        return false;
    } else {
        return posts.get("didInvalidate");
    }
}

export function fetchPostsIfNeeded(section) {
    return (dispatch, getState) => {
        dispatch(getKarma());
        if (getState().viewState.get("selectedPostId") !== null) {
            dispatch(fetchPost(getState().viewState.get("selectedPostId")));
        }

        if (section === undefined) {
            section = getState().viewState.get("postSection");
        }
        if (shouldFetchPosts(section, getState())) {
            dispatch(setIsFetching(section));
            if (section.startsWith("channel:")) {
                let channel = section.substring(8);
                apiGetPostsChannelCombo(getState().account.getIn(["token", "access"]), channel)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted
                        }))
                    })
                    .catch(err => {
                        dispatch(setIsFetching(section, false));
                        handlePermissionDenied(dispatch, getState, err);
                    });
            } else {
                switch (section) {
                    case "location":
                        apiGetPostsCombo(getState().account.getIn(["token", "access"]), getState().viewState.getIn(["location", "latitude"]), getState().viewState.getIn(["location", "longitude"]))
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.recent,
                                    discussed: res.body.replied,
                                    popular: res.body.voted
                                }))
                            })
                            .catch(err => {
                                dispatch(setIsFetching(section, false));
                                handlePermissionDenied(dispatch, getState, err);
                            });
                        break;
                    case "mine":
                        apiGetPostsMineCombo(getState().account.getIn(["token", "access"]))
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.recent,
                                    discussed: res.body.replied,
                                    popular: res.body.voted
                                }))
                            })
                            .catch(err => {
                                dispatch(setIsFetching(section, false));
                                handlePermissionDenied(dispatch, getState, err);
                            });
                        break;
                    case "mineReplies":
                        apiGetPostsMineReplies(getState().account.getIn(["token", "access"]), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            })
                            .catch(err => {
                                dispatch(setIsFetching(section, false));
                                handlePermissionDenied(dispatch, getState, err);
                            });
                        break;
                    case "mineVotes":
                        apiGetPostsMineVotes(getState().account.getIn(["token", "access"]), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            })
                            .catch(err => {
                                dispatch(setIsFetching(section, false));
                                handlePermissionDenied(dispatch, getState, err);
                            });
                        break;
                    case "minePinned":
                        apiGetPostsMinePinned(getState().account.getIn(["token", "access"]), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            })
                            .catch(err => {
                                dispatch(setIsFetching(section, false));
                                handlePermissionDenied(dispatch, getState, err);
                            });
                        break;
                }
            }
        }
    }
}

export function fetchMorePosts(section, sortType) {
    return (dispatch, getState) => {
        if (section === undefined) {
            section = getState().viewState.get("postSection");
        }
        if (sortType === undefined) {
            sortType = getState().viewState.get("postListSortType");
        }
        const postSection = getState().postsBySection.get(section);
        if (postSection === undefined || postSection.isFetching) {
            return;
        }
        const posts = postSection.get(sortType);
        let skip, limit;
        if (section.startsWith("channel:")) {
            let channel = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts.get(posts.size - 1);
            }
            dispatch(setIsFetching(section));
            apiGetPostsChannel(getState().account.getIn(["token", "access"]), sortType, afterId, channel)
                .then(res => {
                    let p = {};
                    p[sortType] = res.body.posts;
                    dispatch(receivePosts(section, p, true));
                })
                .catch(err => {
                    dispatch(setIsFetching(section, false));
                    handlePermissionDenied(dispatch, getState, err);
                });
        } else {
            switch (section) {
                case "location":
                    let afterId;
                    if (posts !== undefined) {
                        afterId = posts.get(posts.size - 1);
                    }
                    dispatch(setIsFetching(section));
                    apiGetPosts(getState().account.getIn(["token", "access"]), sortType, afterId, getState().viewState.getIn(["location", "latitude"]), getState().viewState.getIn(["location", "longitude"]))
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        })
                        .catch(err => {
                            dispatch(setIsFetching(section, false));
                            handlePermissionDenied(dispatch, getState, err);
                        });
                    break;
                case "mine":
                    if (posts !== undefined) {
                        skip = posts.size;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMine(getState().account.getIn(["token", "access"]), sortType, skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        })
                        .catch(err => {
                            dispatch(setIsFetching(section, false));
                            handlePermissionDenied(dispatch, getState, err);
                        });
                    break;
                case "mineReplies":
                    if (sortType != PostListSortTypes.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.size;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMineReplies(getState().account.getIn(["token", "access"]), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        })
                        .catch(err => {
                            dispatch(setIsFetching(section, false));
                            handlePermissionDenied(dispatch, getState, err);
                        });
                    break;
                case "mineVotes":
                    if (sortType != PostListSortTypes.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.size;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMineVotes(getState().account.getIn(["token", "access"]), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        })
                        .catch(err => {
                            dispatch(setIsFetching(section, false));
                            handlePermissionDenied(dispatch, getState, err);
                        });
                    break;
                case "minePinned":
                    if (sortType != PostListSortTypes.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.size;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMinePinned(getState().account.getIn(["token", "access"]), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        })
                        .catch(err => {
                            dispatch(setIsFetching(section, false));
                            handlePermissionDenied(dispatch, getState, err);
                        });
                    break;
            }
        }
    }
}

export function fetchPost(postId) {
    return (dispatch, getState) => {
        apiGetPost(getState().account.getIn(["token", "access"]), postId)
            .then(res => {
                dispatch(receivePost(res.body))
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function getKarma() {
    return (dispatch, getState) => {
        apiGetKarma(getState().account.getIn(["token", "access"]))
            .then(res => {
                dispatch(_setKarma(res.body.karma))
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function getConfig() {
    return (dispatch, getState) => {
        apiGetConfig(getState().account.getIn(["token", "access"]))
            .then(res => {
                dispatch(_setConfig(res.body));
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function addPost(text, image, ancestor, color = "FF9908") {
    return (dispatch, getState) => {
        dispatch(showAddPost(false));
        let loc = getState().viewState.get("location");
        apiAddPost(getState().account.getIn(["token", "access"]), ancestor, color, 0.0, loc.get("latitude"), loc.get("longitude"), loc.get("city"), loc.get("country"), text, image)
            .then(res => {
                dispatch(receivePosts("location", {recent: res.body.posts}));
                if (ancestor !== undefined) {
                    dispatch(fetchPost(ancestor));
                }
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function setDeviceUid(deviceUid) {
    return (dispatch, getState) => {
        const loc = getState().viewState.get("location");
        apiGetAccessToken(deviceUid, loc.get("latitude"), loc.get("longitude"), loc.get("city"), loc.get("country"))
            .then(res => {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(setToken(res.body.distinct_id, res.body.access_token, res.body.refresh_token, res.body.expiration_date, res.body.token_type));
            })
            .catch(err => {
                console.error("Failed to register user.");
            });
    }
}

export function refreshAccessToken() {
    return (dispatch, getState) => {
        const account = getState().account;
        apiRefreshAccessToken(account.getIn(["token", "access"]), account.getIn(["token", "distinctId"]), account.getIn(["token", "refresh"]))
            .then(res => {
                if (res.body.upgraded === true) {
                    dispatch(setToken(account.getIn(["token", "distinctId"]), res.body.access_token, account.getIn(["token", "refresh"]), res.body.expiration_date, res.body.token_type));
                }
            })
            .catch(err => {
                handlePermissionDenied(dispatch, getState, err);
            });
    }
}

export function setLocation(latitude, longitude, city = undefined, country = "DE") {
    return (dispatch, getState) => {
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        dispatch(_setLocation(latitude, longitude, city, country));
        if (getState().account.getIn(["token", "access"]) !== undefined) {
            apiSetPlace(getState().account.getIn(["token", "access"]), latitude, longitude, city, country)
                .catch(err => {
                    handlePermissionDenied(dispatch, getState, err);
                });
        }
    }
}
