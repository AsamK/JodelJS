import type { JodelApi } from '../../app/api';
import Settings from '../../app/settings';
import type { Color } from '../../enums/Color';
import { PostListSortType } from '../../enums/PostListSortType';
import type { Section } from '../../enums/Section';
import { SectionEnum } from '../../enums/Section';
import { ToastType } from '../../enums/ToastType';
import type { UserType } from '../../enums/UserType';
import { VoteType } from '../../enums/VoteType';
import type { IApiPostDetails } from '../../interfaces/IApiPostDetails';
import type { IApiPostListPost } from '../../interfaces/IApiPostListPost';
import type { IJodelAction } from '../../interfaces/IJodelAction';
import type { JodelThunkAction, JodelThunkDispatch } from '../../interfaces/JodelThunkAction';
import {
    setPermissionDenied,
    setToken,
    shareLink,
    showSettings,
    switchPostSection,
    updatePosts,
} from '../actions';
import type { IJodelAppStore } from '../reducers';
import { getPost } from '../reducers/entities';
import { locationSelector } from '../selectors/app';

import { SET_USER_TYPE_RESPONSE } from './action.consts';
import {
    beginRefreshToken,
    invalidatePosts,
    pinnedPost,
    receiveNotifications,
    receivePost,
    receivePosts,
    setChannelsMeta,
    setCountryChannels,
    setIsFetching,
    setLocalChannels,
    setRecommendedChannels,
    setSuggestedHashtags,
    votedPoll,
    votedPost,
    _closeSticky,
    _selectPost,
    _setConfig,
    _setDeviceUID,
    _setKarma,
    _setLocation,
    _setNotificationPostRead,
} from './state';
import { showToast } from './toasts.actions';

interface IResponseError {
    description?: string;
    message: string;
    status: number;
}

function handleNetworkErrors(
    dispatch: JodelThunkDispatch,
    getState: () => IJodelAppStore,
    error: IResponseError | unknown,
): void {
    if (!error || typeof error !== 'object' || !('status' in error)) {
        dispatch(showToast('Kein Internet Zugriff oder Server down.', ToastType.WARNING));
        console.error('No internet access or server down…,', error);
        return;
    }
    const err = error as IResponseError;
    if (err.status === 401) {
        dispatch(showToast('Zugriff verweigert, token ist abgelaufen.', ToastType.ERROR));
        console.error('Permission denied');
        dispatch(setPermissionDenied(true));
    } else if (err.status === 477) {
        dispatch(
            showToast(
                `Zugriff verweigert, Jodel Geheimnis ist veraltet: ${
                    err.description ?? 'unknown error'
                }`,
                ToastType.ERROR,
            ),
        );
        console.error(
            `Request error: Secret is probably outdated ${err.status} ${err.message}: ${
                err.description ?? 'unknown error'
            }`,
        );
    } else if (err.status === 478) {
        dispatch(verify());
        dispatch(
            showToast(
                `Zugriff verweigert, Konto nicht verifiziert: ${
                    err.description ?? 'unknown error'
                }`,
                ToastType.ERROR,
            ),
        );
        console.error(
            `Request error: Account probably not verified ${err.status} ${err.message}: ${
                err.description ?? 'unknown error'
            }`,
        );
        dispatch(showSettings(true));
    } else {
        dispatch(
            showToast(
                `Fehler: ${err.status} ${err.message} ${err.description ?? 'unknown error'}.`,
                ToastType.ERROR,
            ),
        );
        console.error(
            `Request error: ${err.status} ${err.message}: ${err.description ?? 'unknown error'}`,
        );
    }
}

export function deletePost(postId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiDeletePost(postId).then(
            () => dispatch(updatePosts()),
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function upVote(postId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiUpVote(postId).then(
            res => {
                dispatch(votedPost(res.post.post_id, VoteType.UP, res.vote_count));
                dispatch(getKarma());
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function downVote(postId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiDownVote(postId).then(
            res => {
                dispatch(votedPost(res.post.post_id, VoteType.DOWN, res.vote_count));
                dispatch(getKarma());
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function pollVote(postId: string, pollId: string, option: number): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiPollVote(pollId, option).then(
            res => {
                dispatch(votedPoll(postId, pollId, option, res.poll_votes));
                dispatch(getKarma());
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function giveThanks(postId: string, parentPostId?: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGiveThanks(postId).then(
            () => {
                if (parentPostId) {
                    dispatch(updatePost(parentPostId));
                }
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function pin(postId: string, pinned = true): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        if (pinned) {
            api.apiPin(postId).then(
                res => {
                    dispatch(pinnedPost(postId, pinned, res.pin_count));
                },
                err => handleNetworkErrors(dispatch, getState, err),
            );
        } else {
            api.apiUnpin(postId).then(
                res => {
                    dispatch(pinnedPost(postId, pinned, res.pin_count));
                },
                err => handleNetworkErrors(dispatch, getState, err),
            );
        }
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

export function fetchPostsIfNeeded(sectionToFetch?: Section): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        const postId = getState().viewState.selectedPostId;
        if (postId !== null) {
            dispatch(updatePost(postId));
        }

        const section = sectionToFetch ? sectionToFetch : getState().viewState.postSection;

        if (shouldFetchPosts(section, getState())) {
            if (section.startsWith('channel:')) {
                dispatch(setIsFetching(section));
                const channel = section.substring(8);
                api.apiGetPostsChannelCombo(channel, getState().settings.useHomeLocation).then(
                    res => {
                        dispatch(
                            receivePosts(section, {
                                discussed: res.replied,
                                popular: res.voted,
                                recent: res.recent,
                            }),
                        );
                        dispatch(
                            setChannelsMeta([
                                {
                                    channel,
                                    followers: res.followers_count,
                                    sponsored: res.sponsored,
                                },
                            ]),
                        );
                    },
                    err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    },
                );
            }
            if (section.startsWith('hashtag:')) {
                dispatch(setIsFetching(section));
                const hashtag = section.substring(8);
                api.apiGetPostsHashtagCombo(hashtag, getState().settings.useHomeLocation).then(
                    res => {
                        dispatch(
                            receivePosts(section, {
                                discussed: res.replied,
                                popular: res.voted,
                                recent: res.recent,
                            }),
                        );
                    },
                    err => {
                        dispatch(setIsFetching(section, false));
                        handleNetworkErrors(dispatch, getState, err);
                    },
                );
            } else {
                switch (section) {
                    case SectionEnum.LOCATION: {
                        const loc = locationSelector(getState());
                        if (!loc) {
                            break;
                        }
                        dispatch(setIsFetching(section));
                        api.apiGetPostsCombo(
                            loc.latitude,
                            loc.longitude,
                            true,
                            getState().settings.useHomeLocation,
                            false,
                            true,
                        ).then(
                            res => {
                                dispatch(
                                    receivePosts(
                                        section,
                                        {
                                            discussed: res.replied,
                                            popular: res.voted,
                                            recent: res.recent,
                                        },
                                        false,
                                        res.stickies,
                                    ),
                                );
                            },
                            err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            },
                        );
                        break;
                    }
                    case SectionEnum.MINE:
                        dispatch(setIsFetching(section));
                        api.apiGetPostsMineCombo().then(
                            res => {
                                dispatch(
                                    receivePosts(section, {
                                        discussed: res.replied,
                                        popular: res.voted,
                                        recent: res.recent,
                                    }),
                                );
                            },
                            err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            },
                        );
                        break;
                    case SectionEnum.MINE_REPLIES:
                        dispatch(setIsFetching(section));
                        api.apiGetPostsMineReplies().then(
                            res => {
                                dispatch(
                                    receivePosts(section, {
                                        recent: res.posts,
                                    }),
                                );
                            },
                            err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            },
                        );
                        break;
                    case SectionEnum.MINE_VOTES:
                        dispatch(setIsFetching(section));
                        api.apiGetPostsMineVotes().then(
                            res => {
                                dispatch(
                                    receivePosts(section, {
                                        recent: res.posts,
                                    }),
                                );
                            },
                            err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            },
                        );
                        break;
                    case SectionEnum.MINE_PINNED:
                        dispatch(setIsFetching(section));
                        api.apiGetPostsMinePinned().then(
                            res => {
                                dispatch(
                                    receivePosts(section, {
                                        recent: res.posts,
                                    }),
                                );
                            },
                            err => {
                                dispatch(setIsFetching(section, false));
                                handleNetworkErrors(dispatch, getState, err);
                            },
                        );
                        break;
                }
            }
        }
    };
}

export function fetchMorePosts(
    sectionToFetch?: Section,
    sortTypeToFetch?: PostListSortType,
): JodelThunkAction {
    return (dispatch, getState, { api }) => {
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
            api.apiGetPostsChannel(
                sortType,
                afterId,
                channel,
                getState().settings.useHomeLocation,
            ).then(
                res => {
                    const p: { [sortType: string]: IApiPostListPost[] } = {};
                    p[sortType] = res.posts;
                    dispatch(receivePosts(section, p, true));
                },
                err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                },
            );
        } else if (section.startsWith('hashtag:')) {
            const hashtag = section.substring(8);
            let afterId;
            if (posts !== undefined) {
                afterId = posts[posts.length - 1];
            }
            dispatch(setIsFetching(section));
            api.apiGetPostsHashtag(
                sortType,
                afterId,
                hashtag,
                getState().settings.useHomeLocation,
            ).then(
                res => {
                    const p: { [sortType: string]: IApiPostListPost[] } = {};
                    p[sortType] = res.posts;
                    dispatch(receivePosts(section, p, true));
                },
                err => {
                    dispatch(setIsFetching(section, false));
                    handleNetworkErrors(dispatch, getState, err);
                },
            );
        } else {
            let skip;
            let limit;
            switch (section) {
                case SectionEnum.LOCATION: {
                    let afterId;
                    if (posts !== undefined) {
                        afterId = posts[posts.length - 1];
                    }
                    const loc = locationSelector(getState());
                    if (!loc) {
                        break;
                    }
                    dispatch(setIsFetching(section));
                    api.apiGetPosts(
                        sortType,
                        afterId,
                        loc.latitude,
                        loc.longitude,
                        getState().settings.useHomeLocation,
                        true,
                    ).then(
                        res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        },
                        err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        },
                    );
                    break;
                }
                case SectionEnum.MINE:
                    if (posts !== undefined) {
                        skip = posts.length;
                        limit = 10;
                    }
                    dispatch(setIsFetching(section));
                    api.apiGetPostsMine(sortType, skip, limit).then(
                        res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        },
                        err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        },
                    );
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
                    api.apiGetPostsMineReplies(skip, limit).then(
                        res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        },
                        err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        },
                    );
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
                    api.apiGetPostsMineVotes(skip, limit).then(
                        res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        },
                        err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        },
                    );
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
                    api.apiGetPostsMinePinned(skip, limit).then(
                        res => {
                            const p: { [sortType: string]: IApiPostListPost[] } = {};
                            p[sortType] = res.posts;
                            dispatch(receivePosts(section, p, true));
                        },
                        err => {
                            dispatch(setIsFetching(section, false));
                            handleNetworkErrors(dispatch, getState, err);
                        },
                    );
                    break;
            }
        }
    };
}

export function fetchMoreComments(): JodelThunkAction {
    return (dispatch, getState) => {
        const postId = getState().viewState.selectedPostId;
        if (!postId) {
            return;
        }
        const post = getPost(getState(), postId);
        if (post && post.next_reply) {
            const nextReply = post.next_reply;
            if (nextReply != null) {
                dispatch(fetchPost(postId, nextReply, post.oj_filtered));
            }
        }
    };
}

export function updatePost(postId: string, force = false): JodelThunkAction {
    return (dispatch, getState) => {
        const post = getPost(getState(), postId);
        if (!post || force) {
            dispatch(fetchPost(postId));
        } else {
            const count = post.child_count;
            const children = post.children;
            if (!count || !children || children.length === 0) {
                dispatch(fetchPost(postId, undefined, post.oj_filtered));
            } else if (children.length === count) {
                dispatch(fetchCompletePost(postId, post.oj_filtered));
            }
        }
    };
}

function getAllPostDetails(
    api: JodelApi,
    dispatch: JodelThunkDispatch,
    getState: () => IJodelAppStore,
    postId: string,
    nextReply?: string,
    ojFilter = false,
): Promise<IApiPostDetails | void> {
    return api.apiGetPostDetails(postId, true, nextReply, false, ojFilter).then(
        res => {
            if (!res.next) {
                return res;
            }

            return getAllPostDetails(api, dispatch, getState, postId, res.next, ojFilter).then(
                nextRes => {
                    if (!nextRes) {
                        return res;
                    }
                    if (res.replies) {
                        res.replies = res.replies.concat(nextRes.replies);
                    } else {
                        res.replies = nextRes.replies;
                    }
                    return res;
                },
            );
        },
        err => handleNetworkErrors(dispatch, getState, err),
    );
}

export function fetchPost(postId: string, nextReply?: string, ojFilter = false): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetPostDetails(postId, true, nextReply, false, ojFilter).then(
            res => {
                const post = res.details;
                post.children = res.replies;
                post.child_count = post.children.length + res.remaining;
                dispatch(
                    receivePost(post, nextReply !== undefined, res.next, res.shareable, ojFilter),
                );
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

function fetchCompletePost(postId: string, ojFilter = false): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        getAllPostDetails(api, dispatch, getState, postId, undefined, ojFilter).then(
            res => {
                if (!res) {
                    return;
                }
                const post = res.details;
                post.children = res.replies;
                post.child_count = post.children.length;
                dispatch(receivePost(post, false, null, res.shareable, ojFilter));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function getKarma(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetKarma().then(
            res => {
                dispatch(_setKarma(res.karma));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function getConfig(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetConfig().then(
            config => {
                if (!config.verified) {
                    dispatch(verify());
                }
                dispatch(_setConfig(config));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function addPost(
    text: string,
    image?: string,
    channel?: string,
    ancestor?: string,
    color: Color = 'FF9908',
): JodelThunkAction<Promise<Section | null>> {
    return (dispatch, getState, { api }) => {
        const loc = locationSelector(getState());
        if (!loc) {
            return Promise.reject('No location available to post');
        }
        return api
            .apiAddPost(
                channel,
                ancestor,
                color,
                0.0,
                loc.latitude,
                loc.longitude,
                loc.city,
                loc.country,
                text,
                image,
                getState().settings.useHomeLocation,
            )
            .then(
                () => {
                    if (ancestor) {
                        dispatch(updatePost(ancestor, true));
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
                },
            );
    };
}

export function setDeviceUid(deviceUid: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        const loc = locationSelector(getState());
        if (!loc) {
            dispatch(
                showToast('Standort nicht bekannt. Registrierung nicht möglich.', ToastType.ERROR),
            );
            return;
        }
        api.apiGetAccessToken(deviceUid, loc.latitude, loc.longitude, loc.city, loc.country)
            .then(res => {
                dispatch(_setDeviceUID(deviceUid));
                dispatch(
                    setToken(
                        res.distinct_id,
                        res.access_token,
                        res.refresh_token,
                        res.expiration_date,
                        res.token_type,
                    ),
                );
                dispatch(switchPostSection('location'));
            })
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function refreshAccessToken(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        const account = getState().account;
        const token = account.token;
        if (!token) {
            return;
        }
        api.apiRefreshAccessToken(token.distinctId, token.refresh).then(
            res => {
                dispatch(
                    setToken(
                        token.distinctId,
                        res.access_token,
                        token.refresh,
                        res.expiration_date,
                        res.token_type,
                    ),
                );
            },
            (err: { status?: number }) => {
                // Reregister
                if (account.deviceUid && err.status === 401) {
                    console.warn('Failed to refresh token, registering...');
                    dispatch(setDeviceUid(account.deviceUid));
                }

                handleNetworkErrors(dispatch, getState, err);
            },
        );
        dispatch(beginRefreshToken());
    };
}

export function setLocation(
    latitude: number,
    longitude: number,
    city = '',
    country = 'DE',
): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        dispatch(_setLocation(latitude, longitude, city, country));
        if (getState().account.token) {
            api.apiSetLocation(latitude, longitude, city, country).catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
        }
    };
}

export function setHome(
    latitude: number,
    longitude: number,
    city = '',
    country = 'DE',
): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSetAction('SetHomeStarted')
            .then(() => api.apiSetHome(latitude, longitude, city, country))
            .then(() => dispatch(getConfig()))
            .then(() => api.apiSetAction('SetHomeCompleted'))
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function deleteHome(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiDeleteHome()
            .then(() => dispatch(getConfig()))
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function setInternationalFeed(enable: boolean): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        (enable
            ? api.apiEnableFeedInternationalization()
            : api.apiDisableFeedInternationalization()
        )
            .then(() => dispatch(getConfig()))
            .catch(err => {
                handleNetworkErrors(dispatch, getState, err);
            });
    };
}

export function getRecommendedChannels(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetRecommendedChannels(getState().settings.useHomeLocation).then(
            res => {
                dispatch(setRecommendedChannels(res.recommended));
                dispatch(setLocalChannels(res.local));
                dispatch(setCountryChannels(res.country));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function getFollowedChannelsMeta(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        const channels: { [channelName: string]: number } = {};
        const config = getState().account.config;
        if (!config) {
            return;
        }
        config.followed_channels?.forEach(c => {
            const timestamp = getState().settings.channelsLastRead[c];
            channels[c] = timestamp === undefined ? 0 : timestamp;
        });
        api.apiGetFollowedChannelsMeta(channels, getState().settings.useHomeLocation).then(
            res => {
                dispatch(setChannelsMeta(res.channels));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function followChannel(channel: string, follow = true): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        (follow ? api.apiFollowChannel(channel) : api.apiUnfollowChannel(channel)).then(
            () => {
                dispatch(getConfig()); // TODO
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function getSuggestedHashtags(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetSuggestedHashtags(getState().settings.useHomeLocation).then(
            body => {
                dispatch(setSuggestedHashtags(body.hashtags));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function verify(): JodelThunkAction {
    return async (dispatch, getState, { api }) => {
        const gcmAndroidAccount = await api.getGcmAndroidAccount();
        const token = gcmAndroidAccount.gcm_token;
        const android_account = gcmAndroidAccount.android_account;

        await api.apiSetPushToken(Settings.CLIENT_ID, token);

        const gcmVerification = await api.receiveGcmPushVerification(android_account);
        const verification = gcmVerification.verification;
        if (!verification) {
            console.warn('Failed to get gcm verification', gcmVerification);
            return;
        }

        try {
            await api.apiVerifyPush(verification.server_time, verification.verification_code);
            dispatch(getConfig());
        } catch (err) {
            handleNetworkErrors(dispatch, getState, err as IResponseError);
        }
    };
}

export function getNotificationsIfAvailable(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiIsNotificationAvailable().then(
            res => {
                if (res.available) {
                    dispatch(getNotifications());
                }
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function getNotifications(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetNotifications().then(
            res => {
                dispatch(receiveNotifications(res.notifications));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function setNotificationPostRead(postId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSetNotificationPostRead(postId).then(
            () => {
                dispatch(_setNotificationPostRead(postId));
                dispatch(getNotifications());
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function sharePost(postId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSharePost(postId).then(
            res => {
                dispatch(shareLink(postId, res.share_count, res.url));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function ojFilterPost(postId: string, ojFilter: boolean): JodelThunkAction {
    return dispatch => {
        dispatch(fetchPost(postId, undefined, ojFilter));
    };
}

export function searchPosts(message: string, suggested = false): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSearchPosts(message, suggested, getState().settings.useHomeLocation).then(
            res => {
                console.info(res.body);
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function closeSticky(stickyId: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiStickyPostClose(stickyId).then(
            () => {
                dispatch(_closeSticky(stickyId));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function showPictureOfDay(): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiGetPictureOfDay().then(
            res => {
                if (!res) {
                    console.info('No picture of the day available');
                    return;
                }
                dispatch(receivePost(res, false, null, false, false));
                dispatch(_selectPost(res.post_id));
                dispatch(updatePost(res.post_id, true));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function updateUserType(userType: UserType): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSetUserProfile(userType).then(
            () => {
                dispatch(updateUserTypeResponse(userType));
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}

export function updateUserTypeResponse(userType: UserType): IJodelAction {
    return {
        payload: {
            userType,
        },
        type: SET_USER_TYPE_RESPONSE,
    };
}

/**
 * Set the user's language on the server
 *
 * @param language Language name in ISO 639-1 format, e.g. 'de-de'
 */
export function setUserLanguage(language: string): JodelThunkAction {
    return (dispatch, getState, { api }) => {
        api.apiSetUserLanguage(language).then(
            () => {
                dispatch(getConfig());
            },
            err => handleNetworkErrors(dispatch, getState, err),
        );
    };
}
