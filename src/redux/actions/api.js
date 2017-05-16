import {
    apiAddPost,
    apiDeleteHome,
    apiDeletePost,
    apiDownVote,
    apiFollowChannel,
    apiGetAccessToken,
    apiGetConfig,
    apiGetFollowedChannelsMeta,
    apiGetImageCaptcha,
    apiGetKarma,
    apiGetNotifications,
    apiGetPost,
    apiGetPostDetails,
    apiGetPosts,
    apiGetPostsChannel,
    apiGetPostsChannelCombo,
    apiGetPostsCombo,
    apiGetPostsHashtag,
    apiGetPostsHashtagCombo,
    apiGetPostsMine,
    apiGetPostsMineCombo,
    apiGetPostsMinePinned,
    apiGetPostsMineReplies,
    apiGetPostsMineVotes,
    apiGetRecommendedChannels,
    apiGiveThanks,
    apiPin,
    apiRefreshAccessToken,
    apiSendVerificationAnswer,
    apiSetAction,
    apiSetHome,
    apiSetLocation,
    apiSharePost,
    apiUnfollowChannel,
    apiUnpin,
    apiUpVote
} from "../../app/api";
import {
    _setConfig,
    _setDeviceUID,
    _setKarma,
    _setLocation,
    invalidatePosts,
    pinnedPost,
    PostListSortTypes,
    receivePost,
    receivePosts,
    setChannelsMeta,
    setImageCaptcha,
    setIsFetching,
    setRecommendedChannels,
    showAddPost
} from "./state";
import {setPermissionDenied, setToken, showSettings, updatePosts} from "../actions";
import {getLocation} from "../reducers";
import {getPost} from "../reducers/entities";

function handleNetworkErrors(dispatch, getState, err) {
    if (err.status === undefined) {
        console.error('No internet access or server down…');
    } else if (err.status === 401) {
        console.error('Permission denied, reregistering…');
        dispatch(setPermissionDenied(true));
    } else if (err.status === 478) {
        console.error('Request error: Account probably not verified ' + err.status + ' ' + err.message + ': ' + err.response.text);
        dispatch(showSettings(true));
    } else {
        console.error('Request error: ' + err.status + ' ' + err.message + ': ' + err.response.text);
    }
}
export function deletePost(postId) {
    return (dispatch, getState) => {
        apiDeletePost(getAuth(getState), postId)
            .then(res => dispatch(updatePosts()),
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function upVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiUpVote(getAuth(getState), postId)
            .then(res => {
                dispatch(receivePost(res.body.post));
                dispatch(getKarma());
            },
                err => handleNetworkErrors(dispatch, getState, err)
            );
    };
}

export function downVote(postId, parentPostId) {
    return (dispatch, getState) => {
        apiDownVote(getAuth(getState), postId)
            .then(res => {
                dispatch(receivePost(res.body.post));
                dispatch(getKarma());
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function giveThanks(postId, parentPostId) {
    return (dispatch, getState) => {
        apiGiveThanks(getAuth(getState), postId)
            .then(res => dispatch(updatePost(parentPostId)),
                err => handleNetworkErrors(dispatch, getState, err));
    };
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
                dispatch(pinnedPost(postId, pinned, res.body.pin_count));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

function shouldFetchPosts(section, state) {
    const posts = state.postsBySection.get(section);
    if (posts === undefined) {
        return true;
    } else if (posts.get('isFetching')) {
        return false;
    } else {
        return posts.get('didInvalidate');
    }
}

export function fetchPostsIfNeeded(section) {
    return (dispatch, getState) => {
        if (getState().viewState.get('selectedPostId') !== null) {
            dispatch(updatePost(getState().viewState.get('selectedPostId')));
        }

        if (section === undefined) {
            section = getState().viewState.get('postSection');
            if (section === undefined) {
                return;
            }
        }
        if (shouldFetchPosts(section, getState())) {
            dispatch(setIsFetching(section));
            if (section.startsWith('channel:')) {
                let channel = section.substring(8);
                apiGetPostsChannelCombo(getAuth(getState), channel, getState().settings.get('useHomeLocation'))
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted
                        }));
                        dispatch(setChannelsMeta([{
                            channel,
                            followers: res.body.followers_count,
                            sponsored: res.body.sponsored
                        }]));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            }
            if (section.startsWith('hashtag:')) {
                let hashtag = section.substring(8);
                apiGetPostsHashtagCombo(getAuth(getState), hashtag, getState().settings.get('useHomeLocation'))
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
                case 'location':
                    let loc = getLocation(getState());
                    apiGetPostsCombo(getAuth(getState), loc.get('latitude'), loc.get('longitude'), true, getState().settings.get('useHomeLocation'))
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
                    break;
                case 'mine':
                    apiGetPostsMineCombo(getAuth(getState))
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
                    break;
                case 'mineReplies':
                    apiGetPostsMineReplies(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }));
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                    break;
                case 'mineVotes':
                    apiGetPostsMineVotes(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }));
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                    break;
                case 'minePinned':
                    apiGetPostsMinePinned(getAuth(getState), undefined, undefined)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    recent: res.body.posts,
                                }));
                            }, err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            });
                    break;
                }
            }
        }
    };
}

export function fetchMorePosts(section, sortType) {
    return (dispatch, getState) => {
        if (section == null) {
            section = getState().viewState.get('postSection');
        }
        if (sortType == null) {
            sortType = getState().viewState.get('postListSortType');
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
        if (section.startsWith('channel:')) {
            let channel = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts.get(posts.size - 1);
            }
            dispatch(setIsFetching(section));
            apiGetPostsChannel(getAuth(getState), sortType, afterId, channel, getState().settings.get('useHomeLocation'))
                .then(res => {
                    let p = {};
                    p[sortType] = res.body.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else if (section.startsWith('hashtag:')) {
            let hashtag = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts.get(posts.size - 1);
            }
            dispatch(setIsFetching(section));
            apiGetPostsHashtag(getAuth(getState), sortType, afterId, hashtag, getState().settings.get('useHomeLocation'))
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
            case 'location':
                let afterId;
                if (posts !== undefined) {
                    afterId = posts.get(posts.size - 1);
                }
                dispatch(setIsFetching(section));
                let loc = getLocation(getState());
                apiGetPosts(getAuth(getState), sortType, afterId, loc.get('latitude'), loc.get('longitude'), getState().settings.get('useHomeLocation'))
                        .then(res => {
                            let p = {};
                            p[sortType] = res.body.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                break;
            case 'mine':
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
            case 'mineReplies':
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
            case 'mineVotes':
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
            case 'minePinned':
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
    };
}

export function fetchMoreComments() {
    return (dispatch, getState) => {
        const postId = getState().viewState.get('selectedPostId');
        if (postId === undefined) {
            return;
        }
        const post = getPost(getState(), postId);
        if (post.has('next_reply')) {
            let nextReply = post.get('next_reply');
            if (nextReply != null) {
                dispatch(fetchPost(postId, nextReply));
            }
        }
    };
}

export function updatePost(postId) {
    return (dispatch, getState) => {
        let post = getPost(getState(), postId);
        if (post == undefined) {
            dispatch(fetchPost(postId));
        } else {
            let count = post.get('child_count');
            let children = post.get('children');
            if (count == undefined || children == undefined || children.count() == 0) {
                dispatch(fetchPost(postId));
            } else if (children.count() == count) {
                //dispatch(fetchCompletePost(postId));
                // TODO recursive fetch all children
            }
        }
    };
}

export function fetchPost(postId, nextReply) {
    return (dispatch, getState) => {
        apiGetPostDetails(getAuth(getState), postId, true, nextReply, false)
            .then(res => {
                let post = res.body.details;
                post.children = res.body.replies;
                post.child_count = post.children.length + res.body.remaining;
                post.next_reply = res.body.next;
                post.shareable = res.body.shareable;
                dispatch(receivePost(post, nextReply !== undefined));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

/**
 * @deprecated returned post doesn't contain recent features
 * @param postId
 * @returns {function(*=, *=)}
 */
export function fetchCompletePost(postId) {
    return (dispatch, getState) => {
        apiGetPost(getAuth(getState), postId)
            .then(res => {
                dispatch(receivePost(res.body));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getKarma() {
    return (dispatch, getState) => {
        apiGetKarma(getAuth(getState))
            .then(res => {
                dispatch(_setKarma(res.body.karma));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getConfig() {
    return (dispatch, getState) => {
        apiGetConfig(getAuth(getState))
            .then(res => {
                dispatch(_setConfig(res.body));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function addPost(text, image, channel, ancestor, color = 'FF9908') {
    return (dispatch, getState) => {
        let loc = getLocation(getState());
        return apiAddPost(getAuth(getState), channel, ancestor, color, 0.0, loc.get('latitude'), loc.get('longitude'), loc.get('city'), loc.get('country'), text, image, getState().settings.get('useHomeLocation'))
            .then(res => {
                if (ancestor != undefined) {
                    dispatch(updatePost(ancestor));
                    return null;
                } else if (channel != undefined) {
                    const section = 'channel:' + channel;
                    dispatch(invalidatePosts(section));
                    dispatch(fetchPostsIfNeeded(section));
                    return section;
                } else {
                    const section = 'location';
                    dispatch(invalidatePosts(section));
                    dispatch(fetchPostsIfNeeded(section));
                    return section;
                }
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function setDeviceUid(deviceUid) {
    return (dispatch, getState) => {
        let loc = getLocation(getState());
        apiGetAccessToken(deviceUid, loc.get('latitude'), loc.get('longitude'), loc.get('city'), loc.get('country'))
            .then(res => {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(setToken(res.body.distinct_id, res.body.access_token, res.body.refresh_token, res.body.expiration_date, res.body.token_type));
            })
            .catch(err => {
                console.error('Failed to register user.' + err);
            });
    };
}

export function refreshAccessToken() {
    return (dispatch, getState) => {
        const account = getState().account;
        apiRefreshAccessToken(account.getIn(['token', 'access']), account.getIn(['token', 'distinctId']), account.getIn(['token', 'refresh']))
            .then(res => {
                if (res.body.upgraded === true) {
                    dispatch(setToken(account.getIn(['token', 'distinctId']), res.body.access_token, account.getIn(['token', 'refresh']), res.body.expiration_date, res.body.token_type));
                }
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

function getAuth(getState) {
    return getState().account.getIn(['token', 'access']);
}
export function setLocation(latitude, longitude, city = undefined, country = 'DE') {
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
    };
}

export function setHome(latitude, longitude, city = undefined, country = 'DE') {
    return (dispatch, getState) => {
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        let auth = getAuth(getState);
        if (auth !== undefined) {
            apiSetAction(auth, 'SetHomeStarted')
                .then(() => apiSetHome(auth, latitude, longitude, city, country))
                .then(() => dispatch(getConfig()))
                .then(() => apiSetAction(auth, 'SetHomeCompleted'))
                .catch(err => {
                    handleNetworkErrors(dispatch, getState, err);
                });
        }
    };
}

export function deleteHome() {
    return (dispatch, getState) => {
        let auth = getAuth(getState);
        if (auth !== undefined) {
            apiDeleteHome(auth)
                .then(() => dispatch(getConfig()))
                .catch(err => {
                    handleNetworkErrors(dispatch, getState, err);
                });
        }
    };
}


export function getRecommendedChannels() {
    return (dispatch, getState) => {
        apiGetRecommendedChannels(getAuth(getState), getState().settings.get('useHomeLocation'))
            .then(res => {
                dispatch(setRecommendedChannels(res.body.recommended, res.body.local));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getFollowedChannelsMeta() {
    return (dispatch, getState) => {
        let channels = {};
        getState().account.getIn(['config', 'followed_channels']).forEach(c => {
            let timestamp = getState().settings.getIn(['channelsLastRead', c]);
            channels[c] = timestamp === undefined ? 0 : timestamp;
        });
        apiGetFollowedChannelsMeta(getAuth(getState), channels, getState().settings.get('useHomeLocation'))
            .then(res => {
                dispatch(setChannelsMeta(res.body.channels));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
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
    };
}

export function getImageCaptcha() {
    return (dispatch, getState) => {
        apiGetImageCaptcha(getAuth(getState))
            .then(res => {
                dispatch(setImageCaptcha(res.body.key, res.body.image_url, res.body.image_size));
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function sendVerificationAnswer(answer) {
    return (dispatch, getState) => {
        apiSendVerificationAnswer(getAuth(getState), getState().imageCaptcha.get('key'), answer)
            .then(res => {
                dispatch(getConfig());
                dispatch(setImageCaptcha(null, null, 0));
                if (!res.body.verified) {
                    dispatch(getImageCaptcha());
                }
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getNotifications() {
    return (dispatch, getState) => {
        apiGetNotifications(getAuth(getState))
            .then(res => {
                console.log(res.body);
            },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function sharePost(postId) {
    return (dispatch, getState) => {
        apiSharePost(getAuth(getState), postId)
            .then(res => {
                    alert(res.body.url)
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}
