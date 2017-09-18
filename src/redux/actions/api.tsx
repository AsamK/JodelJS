import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {_closeSticky} from './state';

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
    apiStickyPostClose,
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
import {ToastType} from '../../enums/ToastType';
import {VoteType} from '../../enums/VoteType';
import {IApiPostDetails} from '../../interfaces/IApiPostDetails';
import {IApiPostListPost} from '../../interfaces/IApiPostListPost';
import {setPermissionDenied, setToken, showSettings, switchPostSection, updatePosts} from '../actions';
import {IJodelAppStore} from '../reducers';
import {getPost} from '../reducers/entities';
import {getLocation} from '../selectors/app';
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
    setCountryChannels,
    setImageCaptcha,
    setIsFetching,
    setLocalChannels,
    setRecommendedChannels,
    setSuggestedHashtags,
    votedPost,
} from './state';
import {showToast} from './toasts.actions';

function handleNetworkErrors(dispatch: Dispatch<IJodelAppStore>, getState: () => IJodelAppStore, err: any) {
    if (err.status === undefined) {
        dispatch(showToast('Kein Internet Zugriff oder Server down.', ToastType.WARNING));
        console.error('No internet access or server down…,', err);
    } else if (err.status === 401) {
        dispatch(showToast('Zugriff verweigert, token ist abgelaufen.', ToastType.ERROR));
        console.error('Permission denied');
        dispatch(setPermissionDenied(true));
    } else if (err.status === 477) {
        const error = err.response.body ? err.response.body.error : err.response.text;
        dispatch(showToast('Zugriff verweigert, Jodel Geheimnis ist veraltet: ' + error, ToastType.ERROR));
        console.error('Request error: Secret is probably outdated ' + err.status + ' ' + err.message + ': ' +
            err.response.text);
    } else if (err.status === 478) {
        const error = err.response.body ? err.response.body.error : err.response.text;
        dispatch(showToast('Zugriff verweigert, Konto nicht verifiziert: ' + error, ToastType.ERROR));
        console.error('Request error: Account probably not verified ' + err.status + ' ' + err.message + ': ' +
            err.response.text);
        dispatch(showSettings(true));
    } else {
        const error = err.response.body ? err.response.body.error : err.response.text;
        dispatch(showToast(`Fehler: ${err.status} ${err.message} ${error}.`, ToastType.ERROR));
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
                    dispatch(votedPost(res.post.post_id, VoteType.UP, res.vote_count));
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
                    dispatch(votedPost(res.post.post_id, VoteType.DOWN, res.vote_count));
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
                    dispatch(pinnedPost(postId, pinned, res.pin_count));
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
                const channel = section.substring(8);
                apiGetPostsChannelCombo(getAuth(getState()), channel, getState().settings.useHomeLocation)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            discussed: res.replied,
                            popular: res.voted,
                            recent: res.recent,
                        }));
                        dispatch(setChannelsMeta([
                            {
                                channel,
                                followers: res.followers_count,
                                sponsored: res.sponsored,
                            }]));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            }
            if (section.startsWith('hashtag:')) {
                dispatch(setIsFetching(section));
                const hashtag = section.substring(8);
                apiGetPostsHashtagCombo(getAuth(getState()), hashtag, getState().settings.useHomeLocation)
                    .then(res => {
                        dispatch(receivePosts(section, {
                            discussed: res.replied,
                            popular: res.voted,
                            recent: res.recent,
                        }));
                    }, err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    });
            } else {
                switch (section) {
                    case SectionEnum.LOCATION:
                        const loc = getLocation(getState());
                        if (!loc) {
                            break;
                        }
                        dispatch(setIsFetching(section));
                        apiGetPostsCombo(getAuth(getState()), loc.latitude, loc.longitude, true,
                            getState().settings.useHomeLocation)
                            .then(res => {
                                dispatch(receivePosts(section, {
                                    discussed: res.replied,
                                    popular: res.voted,
                                    recent: res.recent,
                                }, false, res.stickies));
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
                                    discussed: res.replied,
                                    popular: res.voted,
                                    recent: res.recent,
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
                                    recent: res.posts,
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
                                    recent: res.posts,
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
                                    recent: res.posts,
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

export function fetchMorePosts(sectionToFetch?: Section,
                               sortTypeToFetch?: PostListSortType): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const section = sectionToFetch ? sectionToFetch : getState().viewState.postSection;
        const sortType = sortTypeToFetch ? sortTypeToFetch : getState().viewState.postListSortType;

        const postSection = getState().postsBySection[section];
        if (!postSection || postSection.isFetching) {
            return;
        }
        const posts = postSection.postsBySortType[sortType];
        if (section.startsWith('channel:')) {
            const channel = section.substring(8);
            const afterId = posts ? posts[posts.length - 1] : undefined;
            dispatch(setIsFetching(section));
            apiGetPostsChannel(getAuth(getState()), sortType, afterId, channel, getState().settings.useHomeLocation)
                .then(res => {
                    const p: { [sortType: string]: IApiPostListPost[] } = {};
                    p[sortType] = res.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else if (section.startsWith('hashtag:')) {
            const hashtag = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts[posts.length - 1];
            }
            dispatch(setIsFetching(section));
            apiGetPostsHashtag(getAuth(getState()), sortType, afterId, hashtag, getState().settings.useHomeLocation)
                .then(res => {
                    const p: { [sortType: string]: IApiPostListPost[] } = {};
                    p[sortType] = res.posts;
                    dispatch(receivePosts(section, p, true));
                }, err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                });
        } else {
            let skip;
            let limit;
            switch (section) {
                case SectionEnum.LOCATION:
                    let afterId;
                    if (posts !== undefined) {
                        afterId = posts[posts.length - 1];
                    }
                    const loc = getLocation(getState());
                    if (!loc) {
                        break;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPosts(getAuth(getState()), sortType, afterId, loc.latitude, loc.longitude,
                        getState().settings.useHomeLocation)
                        .then(res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
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
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_REPLIES:
                    if (sortType !== PostListSortType.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.length;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMineReplies(getAuth(getState()), skip, limit)
                        .then(res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_VOTES:
                    if (sortType !== PostListSortType.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.length;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMineVotes(getAuth(getState()), skip, limit)
                        .then(res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        }, err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        });
                    break;
                case SectionEnum.MINE_PINNED:
                    if (sortType !== PostListSortType.RECENT) {
                        return;
                    }
                    if (posts !== undefined) {
                        skip = posts.length;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    apiGetPostsMinePinned(getAuth(getState()), skip, limit)
                        .then(res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
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
            const nextReply = post.next_reply;
            if (nextReply != null) {
                dispatch(fetchPost(postId, nextReply));
            }
        }
    };
}

export function updatePost(postId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const post = getPost(getState(), postId);
        if (!post) {
            dispatch(fetchPost(postId));
        } else {
            const count = post.child_count;
            const children = post.children;
            if (!count || !children || children.length === 0) {
                dispatch(fetchPost(postId));
            } else if (children.length === count) {
                dispatch(fetchCompletePost(postId));
            }
        }
    };
}

function getAllPostDetails(dispatch: Dispatch<IJodelAppStore>, getState: () => IJodelAppStore, postId: string,
                           nextReply?: string): Promise<IApiPostDetails | void> {
    return apiGetPostDetails(getAuth(getState()), postId, true, nextReply, false)
        .then(res => {
                if (!res.next) {
                    return res;
                }

                return getAllPostDetails(dispatch, getState, postId, res.next)
                    .then(nextRes => {
                        if (!nextRes) {
                            return res;
                        }
                        if (res.replies) {
                            res.replies = res.replies.concat(nextRes.replies);
                        } else {
                            res.replies = nextRes.replies;
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
                    const post = res.details;
                    post.children = res.replies;
                    post.child_count = post.children.length + res.remaining;
                    dispatch(receivePost(post, nextReply !== undefined, res.next, res.shareable));
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
                    const post = res.details;
                    post.children = res.replies;
                    post.child_count = post.children.length;
                    dispatch(receivePost(post, false, null, res.shareable));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getKarma(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetKarma(getAuth(getState()))
            .then(res => {
                    dispatch(_setKarma(res.karma));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getConfig(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiGetConfig(getAuth(getState()))
            .then(config => {
                    if (!config.verified) {
                        dispatch(verify());
                    }
                    dispatch(_setConfig(config));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function addPost(text: string, image?: string, channel?: string, ancestor?: string,
                        color = 'FF9908'): ThunkAction<Promise<Section | null>, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const loc = getLocation(getState());
        if (!loc) {
            return Promise.reject('No location available to post');
        }
        return apiAddPost(getAuth(getState()), channel, ancestor, color, 0.0, loc.latitude, loc.longitude, loc.city,
            loc.country, text, image, getState().settings.useHomeLocation)
            .then(res => {
                    if (ancestor) {
                        dispatch(updatePost(ancestor));
                        return null;
                    } else if (channel) {
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
        const loc = getLocation(getState());
        if (!loc) {
            return;
        }
        apiGetAccessToken(deviceUid, loc.latitude, loc.longitude, loc.city, loc.country)
            .then(res => {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(setToken(res.distinct_id, res.access_token, res.refresh_token,
                    res.expiration_date, res.token_type));
                dispatch(switchPostSection('location'));
            })
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function refreshAccessToken(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const account = getState().account;
        const token = account.token;
        if (!token) {
            return;
        }
        apiRefreshAccessToken(token.access, token.distinctId, token.refresh)
            .then(res => {
                    if (res.upgraded === true) {
                        dispatch(setToken(token.distinctId, res.access_token, token.refresh, res.expiration_date,
                            res.token_type));
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

export function setLocation(latitude: number, longitude: number, city: string = '',
                            country = 'DE'): ThunkAction<void, IJodelAppStore, void> {
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

export function setHome(latitude: number, longitude: number, city: string = '',
                        country = 'DE'): ThunkAction<void, IJodelAppStore, void> {
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
                    dispatch(setRecommendedChannels(res.recommended));
                    dispatch(setLocalChannels(res.local));
                    dispatch(setCountryChannels(res.country));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function getFollowedChannelsMeta(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        const channels: { [channelName: string]: number } = {};
        const config = getState().account.config;
        if (!config) {
            return;
        }
        config.followed_channels.forEach(c => {
            const timestamp = getState().settings.channelsLastRead[c];
            channels[c] = timestamp === undefined ? 0 : timestamp;
        });
        apiGetFollowedChannelsMeta(getAuth(getState()), channels, getState().settings.useHomeLocation)
            .then(res => {
                    dispatch(setChannelsMeta(res.channels));
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
                    dispatch(setImageCaptcha(res.key, res.image_url, res.image_size));
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
                    if (!res.verified) {
                        dispatch(getImageCaptcha());
                    }
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function verify(): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        getGcmAndroidAccount().then(res => {
            const token = res.gcm_token;
            const android_account = res.android_account;
            return apiSetPushToken(getAuth(getState()), Settings.CLIENT_ID, token)
                .then(() => {
                    return android_account;
                });
        }).then(androidAccount => {
            return receiveGcmPushVerification(androidAccount);
        }).then(res => {
            const verification = res.verification;
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
                    if (res.available) {
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
                    dispatch(receiveNotifications(res.notifications));
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
                    alert(res.url);
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function searchPosts(message: string, suggested = false): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiSearchPosts(getAuth(getState()), message, suggested, getState().settings.useHomeLocation)
            .then(res => {
                    console.info(res.body);
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}

export function closeSticky(stickyId: string): ThunkAction<void, IJodelAppStore, void> {
    return (dispatch, getState) => {
        apiStickyPostClose(getAuth(getState()), stickyId)
            .then(res => {
                    dispatch(_closeSticky(stickyId));
                },
                err => handleNetworkErrors(dispatch, getState, err));
    };
}
