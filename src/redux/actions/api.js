import {
    apiGetAccessToken,
    apiGetPostsCombo,
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
    apiSetLocation,
    apiGetPostsChannelCombo,
    apiGetPostsChannel,
    apiPin,
    apiUnpin,
    apiGetPostsMinePinned,
    apiGetRecommendedChannels,
    apiFollowChannel,
    apiUnfollowChannel,
    apiGetFollowedChannelsMeta,
    apiGetPostsHashtagCombo,
    apiGetPostsHashtag,
    apiGiveThanks,
    apiGetPostDetails
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
    pinnedPost,
    setRecommendedChannels,
    setChannelsMeta
} from "./state";
import {setToken, setPermissionDenied, updatePosts} from "../actions";

function handleNetworkErrors(dispatch, getState, err) {
    if (err.status === undefined) {
        console.error("No internet access or server down…");
    } else if (err.status === 401) {
        console.error("Permission denied, reregistering…");
        dispatch(setPermissionDenied(true));
    } else {
        console.error("Request error: " + err.status + " " + err.message + ": " + err.response.text)
    }
}
export function deletePost(postId) {
    return (dispatch, getState) => {
        apiDeletePost(getAuth(getState), postId)
            .then(res => dispatch(updatePosts()),
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function upVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiUpVote(getAuth(getState), postId)
            .then(res => dispatch(receivePost(res.body.post)),
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function downVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiDownVote(getAuth(getState), postId)
            .then(res => dispatch(receivePost(res.body.post)),
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function giveThanks(postId, parentPostId) {
    return (dispatch, getState) => {
        apiGiveThanks(getAuth(getState), postId)
            .then(res => dispatch(fetchPost(parentPostId)),
                err => handleNetworkErrors(dispatch, getState, err));
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
        fn(getAuth(getState), postId)
            .then(res => {
                    dispatch(pinnedPost(postId, pinned, res.body.pin_count))
                },
                err => handleNetworkErrors(dispatch, getState, err));
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
            if (section === undefined) {
                return;
            }
        }
        if (shouldFetchPosts(section, getState())) {
            dispatch(setIsFetching(section));
            if (section.startsWith("channel:")) {
                let channel = section.substring(8);
                apiGetPostsChannelCombo(getAuth(getState), channel)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted
                        }));
                        dispatch(setChannelsMeta([{channel, followers: res.body.followers_count}]));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            }
            if (section.startsWith("hashtag:")) {
                let hashtag = section.substring(8);
                apiGetPostsHashtagCombo(getAuth(getState), hashtag)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted
                        }));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            } else {
                switch (section) {
                    case "location":
                        apiGetPostsCombo(getAuth(getState), getState().viewState.getIn(["location", "latitude"]), getState().viewState.getIn(["location", "longitude"]))
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.recent,
                                    discussed: res.body.replied,
                                    popular: res.body.voted
                                }))
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                        break;
                    case "mine":
                        apiGetPostsMineCombo(getAuth(getState))
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.recent,
                                    discussed: res.body.replied,
                                    popular: res.body.voted
                                }))
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                        break;
                    case "mineReplies":
                        apiGetPostsMineReplies(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                        break;
                    case "mineVotes":
                        apiGetPostsMineVotes(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                        break;
                    case "minePinned":
                        apiGetPostsMinePinned(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }))
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                        break;
                }
            }
        }
    }
}

export function fetchMorePosts(section, sortType) {
    return (dispatch, getState) => {
        if (section == null) {
            section = getState().viewState.get("postSection");
        }
        if (sortType == null) {
            sortType = getState().viewState.get("postListSortType");
        }
        if (sortType == null || section == null) {
            return;
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
            apiGetPostsChannel(getAuth(getState), sortType, afterId, channel)
                .then(res => {
                    let p = {};
                    p[sortType] = res.body.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else if (section.startsWith("hashtag:")) {
            let hashtag = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts.get(posts.size - 1);
            }
            dispatch(setIsFetching(section));
            apiGetPostsHashtag(getAuth(getState), sortType, afterId, hashtag)
                .then(res => {
                    let p = {};
                    p[sortType] = res.body.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else {
            switch (section) {
                case "location":
                    let afterId;
                    if (posts !== undefined) {
                        afterId = posts.get(posts.size - 1);
                    }
                    dispatch(setIsFetching(section));
                    apiGetPosts(getAuth(getState), sortType, afterId, getState().viewState.getIn(["location", "latitude"]), getState().viewState.getIn(["location", "longitude"]))
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case "mine":
                    if (posts !== undefined) {
                        skip = posts.size;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMine(getAuth(getState), sortType, skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
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
                    apiGetPostsMineReplies(getAuth(getState), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
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
                    apiGetPostsMineVotes(getAuth(getState), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
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
                    apiGetPostsMinePinned(getAuth(getState), skip, limit)
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
            }
        }
    }
}

export function fetchPost(postId) {
    return (dispatch, getState) => {
        apiGetPostDetails(getAuth(getState), postId)
            .then(res => {
                    let post = res.body.details;
                    post.children = res.body.replies;
                    dispatch(receivePost(post))
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function getKarma() {
    return (dispatch, getState) => {
        apiGetKarma(getAuth(getState))
            .then(res => {
                    dispatch(_setKarma(res.body.karma))
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function getConfig() {
    return (dispatch, getState) => {
        apiGetConfig(getAuth(getState))
            .then(res => {
                    dispatch(_setConfig(res.body));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function addPost(text, image, channel, ancestor, color = "FF9908") {
    return (dispatch, getState) => {
        let loc = getState().viewState.get("location");
        return apiAddPost(getAuth(getState), channel, ancestor, color, 0.0, loc.get("latitude"), loc.get("longitude"), loc.get("city"), loc.get("country"), text, image)
            .then(res => {
                    dispatch(receivePosts("location", {recent: res.body.posts}));
                    if (ancestor != undefined) {
                        dispatch(fetchPost(ancestor));
                    }
                },
                err => handleNetworkErrors(dispatch, getState, err));
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
                console.error("Failed to register user." + err);
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
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

function getAuth(getState) {
    return getState().account.getIn(["token", "access"]);
}
export function setLocation(latitude, longitude, city = undefined, country = "DE") {
    return (dispatch, getState) => {
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        dispatch(_setLocation(latitude, longitude, city, country));
        let auth = getAuth(getState);
        if (auth !== undefined) {
            apiSetLocation(auth, latitude, longitude, city, country)
                .catch(err => {
                    handleNetworkErrors(dispatch, getState, err);
                });
        }
    }
}

export function getRecommendedChannels() {
    return (dispatch, getState) => {
        apiGetRecommendedChannels(getAuth(getState))
            .then(res => {
                    dispatch(setRecommendedChannels(res.body.recommended));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function getFollowedChannelsMeta() {
    return (dispatch, getState) => {
        let channels = {};
        getState().account.getIn(["config", "followed_channels"]).forEach(c => {
            let timestamp = getState().viewState.getIn(["channelsLastRead", c]);
            channels[c] = timestamp === undefined ? 0 : timestamp;
        });
        apiGetFollowedChannelsMeta(getAuth(getState), channels)
            .then(res => {
                    dispatch(setChannelsMeta(res.body.channels));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}

export function followChannel(channel, follow = true) {
    return (dispatch, getState) => {
        let fn;
        if (follow) {
            fn = apiFollowChannel;
        } else {
            fn = apiUnfollowChannel;
        }
        fn(getAuth(getState), channel)
            .then(res => {
                    dispatch(getConfig()); // TODO
                },
                err => handleNetworkErrors(dispatch, getState, err));
    }
}
