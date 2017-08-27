import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import * as request from 'superagent';

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
    apiGetSuggestedHashtags,
    apiGiveThanks,
    apiIsNotificationAvailable,
    apiPin,
    apiRefreshAccessToken,
    apiSearchPosts,
    apiSendVerificationAnswer,
    apiSetAction,
    apiSetHome,
    apiSetLocation,
    apiSetNotificationPostRead,
    apiSetPushToken,
    apiSharePost,
    apiUnfollowChannel,
    apiUnpin,
    apiUpVote,
    apiVerifyPush,
    getGcmAndroidAccount,
    receiveGcmPushVerification,
} from '../../app/api';
import Settings from '../../app/settings';
import {PostListSortType} from '../../enums/PostListSortType';
import {Section, SectionEnum} from '../../enums/Section';
import {IConfig} from '../../interfaces/IConfig';
import {IApiPost} from '../../interfaces/IPost';
import {setPermissionDenied, setToken, showSettings, switchPostSection, updatePosts} from '../actions';
import {getLocation, IJodelAppStore} from '../reducers';
import {getPost} from '../reducers/entities';
import {
    _setConfig,
    _setDeviceUID,
    _setKarma,
    _setLocation,
    _setNotificationPostRead,
    invalidatePosts,
    pinnedPost,
    receiveNotifications,
    receivePost,
    receivePosts,
    setChannelsMeta,
    setImageCaptcha,
    setIsFetching,
    setLocalChannels,
    setRecommendedChannels,
    setSuggestedHashtags,
} from './state';

function handleNetworkErrors(dispatch: Dispatch<IJodelAppStore>, getState: () => IJodelAppStore, err: any) {
    if (err.status === undefined) {
        console.error('No internet access or server down…,', err);
    } else if (err.status === 401) {
        console.error('Permission denied');
        dispatch(setPermissionDenied(true));
    } else if (err.status === 478) {
        console.error('Request error: Account probably not verified ' + err.status + ' ' + err.message + ': ' + err.response.text);
        dispatch(showSettings(true));
    } else {
        console.error('Request error: ' + err.status + ' ' + err.message + ': ' + err.response.text);
    }
}

export function deletePost(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiDeletePost(getAuth(getState()), postId)
            .then(res => dispatch(updatePosts()),
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function upVote(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiUpVote(getAuth(getState()), postId)
            .then(res => {
                    dispatch(receivePost(res.body.post));
                    dispatch(getKarma());
                },
                err => handleNetworkErrors(dispatch, getState, err),
            );
    };
}

export function downVote(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiDownVote(getAuth(getState()), postId)
            .then(res => {
                    dispatch(receivePost(res.body.post));
                    dispatch(getKarma());
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function giveThanks(postId: string, parentPostId?: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGiveThanks(getAuth(getState()), postId)
            .then(res => {
                    if (parentPostId) {
                        dispatch(updatePost(parentPostId));
                    }
                },
                err => handleNetworkErrors(dispatch, getState, err),
            );
    };
}

export function pin(postId: string, pinned = true): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let fn;
        if (pinned) {
            fn = apiPin;
        } else {
            fn = apiUnpin;
        }
        fn(getAuth(getState()), postId)
            .then(res => {
                    dispatch(pinnedPost(postId, pinned, res.body.pin_count));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

function shouldFetchPosts(section: Section, state: IJodelAppStore): boolean {
    const posts = state.postsBySection[section];
    if (posts === undefined) {
        return true;
    } else if (posts.isFetching) {
        return false;
    } else {
        return posts.didInvalidate;
    }
}

export function fetchPostsIfNeeded(sectionToFetch?: Section): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const postId = getState().viewState.selectedPostId;
        if (postId !== null) {
            dispatch(updatePost(postId));
        }

        const section = sectionToFetch ? sectionToFetch : getState().viewState.postSection;

        if (shouldFetchPosts(section, getState())) {
            if (section.startsWith('channel:')) {
                dispatch(setIsFetching(section));
                let channel = section.substring(8);
                apiGetPostsChannelCombo(getAuth(getState()), channel, getState().settings.useHomeLocation)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted,
                        }));
                        dispatch(setChannelsMeta([
                            {
                                channel,
                                followers: res.body.followers_count,
                                sponsored: res.body.sponsored,
                            }]));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            }
            if (section.startsWith('hashtag:')) {
                dispatch(setIsFetching(section));
                let hashtag = section.substring(8);
                apiGetPostsHashtagCombo(getAuth(getState()), hashtag, getState().settings.useHomeLocation)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            recent: res.body.recent,
                            discussed: res.body.replied,
                            popular: res.body.voted,
                        }));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            } else {
                switch (section) {
                case SectionEnum.LOCATION:
                    let loc = getLocation(getState());
                    if (!loc) {
                        break;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsCombo(getAuth(getState()), loc.latitude, loc.longitude, true, getState().settings.useHomeLocation)
                        .then(res => {
                            dispatch(receivePosts(section, {
                                recent: res.body.recent,
                                discussed: res.body.replied,
                                popular: res.body.voted,
                            }));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE:
                    dispatch(setIsFetching(section));
                    apiGetPostsMineCombo(getAuth(getState()))
                        .then(res => {
                            dispatch(receivePosts(section, {
                                recent: res.body.recent,
                                discussed: res.body.replied,
                                popular: res.body.voted,
                            }));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_REPLIES:
                    dispatch(setIsFetching(section));
                    apiGetPostsMineReplies(getAuth(getState()))
                        .then(res => {
                            dispatch(receivePosts(section, {
                                recent: res.body.posts,
                            }));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_VOTES:
                    dispatch(setIsFetching(section));
                    apiGetPostsMineVotes(getAuth(getState()))
                        .then(res => {
                            dispatch(receivePosts(section, {
                                recent: res.body.posts,
                            }));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_PINNED:
                    dispatch(setIsFetching(section));
                    apiGetPostsMinePinned(getAuth(getState()))
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

export function fetchMorePosts(sectionToFetch?: Section, sortTypeToFetch?: PostListSortType): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const section = sectionToFetch ? sectionToFetch : getState().viewState.postSection;
        const sortType = sortTypeToFetch ? sortTypeToFetch : getState().viewState.postListSortType;

        const postSection = getState().postsBySection[section];
        if (!postSection || postSection.isFetching) {
            return;
        }
        const posts = postSection.postsBySortType[sortType];
        if (section.startsWith('channel:')) {
            let channel = section.substring(8);
            const afterId = posts ? posts[posts.length - 1] : undefined;
            dispatch(setIsFetching(section));
            apiGetPostsChannel(getAuth(getState()), sortType, afterId, channel, getState().settings.useHomeLocation)
                .then(res => {
                    let p: { [sortType: string]: IApiPost[] } = {};
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
                afterId = posts[posts.length - 1];
            }
            dispatch(setIsFetching(section));
            apiGetPostsHashtag(getAuth(getState()), sortType, afterId, hashtag, getState().settings.useHomeLocation)
                .then(res => {
                    let p: { [sortType: string]: IApiPost[] } = {};
                    p[sortType] = res.body.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else {
            let skip, limit;
            switch (section) {
            case SectionEnum.LOCATION:
                let afterId;
                if (posts !== undefined) {
                    afterId = posts[posts.length - 1];
                }
                let loc = getLocation(getState());
                if (!loc) {
                    break;
                }
                dispatch(setIsFetching(section));
                apiGetPosts(getAuth(getState()), sortType, afterId, loc.latitude, loc.longitude, getState().settings.useHomeLocation)
                    .then(res => {
                        let p: { [sortType: string]: IApiPost[] } = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
                break;
            case SectionEnum.MINE:
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMine(getAuth(getState()), sortType, skip, limit)
                    .then(res => {
                        let p: { [sortType: string]: IApiPost[] } = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
                break;
            case SectionEnum.MINE_REPLIES:
                if (sortType != PostListSortType.RECENT) {
                    return;
                }
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMineReplies(getAuth(getState()), skip, limit)
                    .then(res => {
                        let p: { [sortType: string]: IApiPost[] } = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
                break;
            case SectionEnum.MINE_VOTES:
                if (sortType != PostListSortType.RECENT) {
                    return;
                }
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMineVotes(getAuth(getState()), skip, limit)
                    .then(res => {
                        let p: { [sortType: string]: IApiPost[] } = {};
                        p[sortType] = res.body.posts;
                        dispatch(receivePosts(section, p, true));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
                break;
            case SectionEnum.MINE_PINNED:
                if (sortType != PostListSortType.RECENT) {
                    return;
                }
                if (posts !== undefined) {
                    skip = posts.length;
                    limit = 10;
                }
                dispatch(setIsFetching(section));
                apiGetPostsMinePinned(getAuth(getState()), skip, limit)
                    .then(res => {
                        let p: { [sortType: string]: IApiPost[] } = {};
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

export function fetchMoreComments(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const postId = getState().viewState.selectedPostId;
        if (!postId) {
            return;
        }
        const post = getPost(getState(), postId);
        if (post && post.next_reply) {
            let nextReply = post.next_reply;
            if (nextReply != null) {
                dispatch(fetchPost(postId, nextReply));
            }
        }
    };
}

export function updatePost(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let post = getPost(getState(), postId);
        if (post == undefined) {
            dispatch(fetchPost(postId));
        } else {
            let count = post.child_count;
            let children = post.children;
            if (count == undefined || children == undefined || children.length == 0) {
                dispatch(fetchPost(postId));
            } else if (children.length == count) {
                dispatch(fetchCompletePost(postId));
            }
        }
    };
}

function getAllPostDetails(dispatch: Dispatch<IJodelAppStore>, getState: () => IJodelAppStore, postId: string, nextReply?: string): Promise<request.Response | void> {
    return apiGetPostDetails(getAuth(getState()), postId, true, nextReply, false)
        .then(res => {
                if (!res.body.next) {
                    return res;
                }

                return getAllPostDetails(dispatch, getState, postId, res.body.next)
                    .then(nextRes => {
                        if (!nextRes) {
                            return res;
                        }
                        if (res.body.replies) {
                            res.body.replies = res.body.replies.concat(nextRes.body.replies);
                        } else {
                            res.body.replies = nextRes.body.replies;
                        }
                        return res;
                    });
            },
            err => handleNetworkErrors(dispatch, getState, err));
}

export function fetchPost(postId: string, nextReply?: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetPostDetails(getAuth(getState()), postId, true, nextReply, false)
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

export function fetchCompletePost(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        getAllPostDetails(dispatch, getState, postId)
            .then(res => {
                    if (!res) {
                        return;
                    }
                    let post = res.body.details;
                    post.children = res.body.replies;
                    post.child_count = post.children.length;
                    post.next_reply = res.body.next;
                    post.shareable = res.body.shareable;
                    dispatch(receivePost(post));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getKarma(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetKarma(getAuth(getState()))
            .then(res => {
                    dispatch(_setKarma(res.body.karma));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getConfig(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetConfig(getAuth(getState()))
            .then(res => {
                    const config: IConfig = res.body;
                    if (!config.verified) {
                        dispatch(verify());
                    }
                    dispatch(_setConfig(res.body));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function addPost(text: string, image?: string, channel?: string, ancestor?: string, color = 'FF9908'): ThunkAction<Promise<Section | null>, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let loc = getLocation(getState());
        if (!loc) {
            return Promise.reject('No location available to post');
        }
        return apiAddPost(getAuth(getState()), channel, ancestor, color, 0.0, loc.latitude, loc.longitude, loc.city, loc.country, text, image, getState().settings.useHomeLocation)
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
                        const section = SectionEnum.LOCATION;
                        dispatch(invalidatePosts(section));
                        dispatch(fetchPostsIfNeeded(section));
                        return section;
                    }
                },
                err => {
                    handleNetworkErrors(dispatch, getState, err);
                    return null;
                });
    };
}

export function setDeviceUid(deviceUid: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let loc = getLocation(getState());
        if (!loc) {
            return;
        }
        apiGetAccessToken(deviceUid, loc.latitude, loc.longitude, loc.city, loc.country)
            .then(res => {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(setToken(res.body.distinct_id, res.body.access_token, res.body.refresh_token, res.body.expiration_date, res.body.token_type));
                dispatch(switchPostSection('location'));
                dispatch(getKarma());
                dispatch(getConfig());
            })
            .catch(err => {
                console.error('Failed to register user.' + err);
            });
    };
}

export function refreshAccessToken(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const account = getState().account;
        if (!account.token) {
            return;
        }
        apiRefreshAccessToken(account.token.access, account.token.distinctId, account.token.refresh)
            .then(res => {
                    if (!account.token) {
                        return;
                    }
                    if (res.body.upgraded === true) {
                        dispatch(setToken(account.token.distinctId, res.body.access_token, account.token.refresh, res.body.expiration_date, res.body.token_type));
                        dispatch(fetchPostsIfNeeded());
                    }
                },
                err => {
                    // Reregister
                    if (account.deviceUid && err.status === 401) {
                        console.warn('Failed to refresh token, registering...');
                        dispatch(setDeviceUid(account.deviceUid));
                    }

                    handleNetworkErrors(dispatch, getState, err);
                });
    };
}

function getAuth(state: IJodelAppStore) {
    if (!state.account.token) {
        return '';
    }
    return state.account.token.access;
}

export function setLocation(latitude: number, longitude: number, city: string = '', country = 'DE'): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        dispatch(_setLocation(latitude, longitude, city, country));
        if (getState().account.token) {
            apiSetLocation(getAuth(getState()), latitude, longitude, city, country)
                .catch(err => {
                    handleNetworkErrors(dispatch, getState, err);
                });
        }
    };
}

export function setHome(latitude: number, longitude: number, city: string = '', country = 'DE'): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        const auth = getAuth(getState());
        apiSetAction(auth, 'SetHomeStarted')
            .then(() => apiSetHome(auth, latitude, longitude, city, country))
            .then(() => dispatch(getConfig()))
            .then(() => apiSetAction(auth, 'SetHomeCompleted'))
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function deleteHome(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiDeleteHome(getAuth(getState()))
            .then(() => dispatch(getConfig()))
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}


export function getRecommendedChannels(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetRecommendedChannels(getAuth(getState()), getState().settings.useHomeLocation)
            .then(res => {
                    dispatch(setRecommendedChannels(res.body.recommended));
                    dispatch(setLocalChannels(res.body.local));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getFollowedChannelsMeta(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let channels: { [channelName: string]: number } = {};
        const config = getState().account.config;
        if (!config) {
            return;
        }
        config.followed_channels.forEach(c => {
            let timestamp = getState().settings.channelsLastRead[c];
            channels[c] = timestamp === undefined ? 0 : timestamp;
        });
        apiGetFollowedChannelsMeta(getAuth(getState()), channels, getState().settings.useHomeLocation)
            .then(res => {
                    dispatch(setChannelsMeta(res.body.channels));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function followChannel(channel: string, follow = true): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        let fn;
        if (follow) {
            fn = apiFollowChannel;
        } else {
            fn = apiUnfollowChannel;
        }
        fn(getAuth(getState()), channel)
            .then(res => {
                    dispatch(getConfig()); // TODO
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getSuggestedHashtags(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetSuggestedHashtags(getAuth(getState()), getState().settings.useHomeLocation)
            .then(res => {
                    dispatch(setSuggestedHashtags(res.body.hashtags));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getImageCaptcha(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetImageCaptcha(getAuth(getState()))
            .then(res => {
                    dispatch(setImageCaptcha(res.body.key, res.body.image_url, res.body.image_size));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function sendVerificationAnswer(answer: number[]): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const imageCaptchaKey = getState().imageCaptcha.key;
        if (!imageCaptchaKey) {
            return;
        }
        apiSendVerificationAnswer(getAuth(getState()), imageCaptchaKey, answer)
            .then(res => {
                    dispatch(getConfig());
                    dispatch(setImageCaptcha(null, null, null));
                    if (!res.body.verified) {
                        dispatch(getImageCaptcha());
                    }
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function verify(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        getGcmAndroidAccount().then(res => {
            const token = res.body.gcm_token;
            const android_account = res.body.android_account;
            return apiSetPushToken(getAuth(getState()), Settings.CLIENT_ID, token)
                .then((res) => {
                    return android_account;
                });
        }).then((android_account) => {
            return receiveGcmPushVerification(android_account);
        }).then((res) => {
            const verification = res.body.verification;
            return apiVerifyPush(getAuth(getState()), verification.server_time, verification.verification_code);
        }).then(() => {
                dispatch(getConfig());
            }, err => {
                handleNetworkErrors(dispatch, getState, err);
            },
        );
    };
}

export function getNotificationsIfAvailable(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiIsNotificationAvailable(getAuth(getState()))
            .then(res => {
                    if (res.body.available) {
                        dispatch(getNotifications());
                    }
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getNotifications(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetNotifications(getAuth(getState()))
            .then(res => {
                    dispatch(receiveNotifications(res.body.notifications));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function setNotificationPostRead(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiSetNotificationPostRead(getAuth(getState()), postId)
            .then(res => {
                    dispatch(_setNotificationPostRead(postId));
                    dispatch(getNotifications());
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function sharePost(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiSharePost(getAuth(getState()), postId)
            .then(res => {
                    alert(res.body.url);
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function searchPosts(message: string, suggested = false): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiSearchPosts(getAuth(getState()), message, suggested, getState().settings.useHomeLocation)
            .then(res => {
                    console.log(res.body);
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}
