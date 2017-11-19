import {PostListSortType} from '../../enums/PostListSortType';
import {Section} from '../../enums/Section';
import {TokenType} from '../../enums/TokenType';
import {VoteType} from '../../enums/VoteType';
import {IApiConfig} from '../../interfaces/IApiConfig';
import {IApiPostDetailsPost, IApiPostReplyPost} from '../../interfaces/IApiPostDetailsPost';
import {IApiPostListPost} from '../../interfaces/IApiPostListPost';
import {IApiSticky} from '../../interfaces/IApiSticky';
import {IChannel} from '../../interfaces/IChannel';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INotification} from '../../interfaces/INotification';
import {IViewStateStore} from '../reducers/viewState';
import {
    CLOSE_STICKY,
    INVALIDATE_POSTS,
    PINNED_POST,
    RECEIVE_NOTIFICATIONS,
    RECEIVE_POST,
    RECEIVE_POSTS,
    REPLACE_VIEW_STATE,
    SELECT_PICTURE,
    SELECT_POST,
    SET_CHANNELS_META,
    SET_CONFIG,
    SET_COUNTRY_CHANNELS,
    SET_DEVICE_UID,
    SET_IMAGE_CAPTCHA,
    SET_IS_FETCHING,
    SET_KARMA,
    SET_LOCAL_CHANNELS,
    SET_LOCATION,
    SET_NOTIFICATION_POST_READ,
    SET_PERMISSION_DENIED,
    SET_RECOMMENDED_CHANNELS,
    SET_SUGGESTED_HASHTAGS,
    SET_TOKEN,
    SET_TOKEN_PENDING,
    SET_USE_BROWSER_LOCATION,
    SET_USE_HOME_LOCATION,
    SHOW_ADD_POST,
    SHOW_CHANNEL_LIST,
    SHOW_NOTIFICATIONS,
    SHOW_SEARCH,
    SHOW_SETTINGS,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
    VOTED_POST,
} from './action.consts';

export function _switchPostListSortType(sortType: PostListSortType): IJodelAction {
    return {
        payload: {sortType},
        type: SWITCH_POST_LIST_SORT_TYPE,
    };
}

export function _switchPostSection(section: Section): IJodelAction {
    return {
        payload: {section},
        type: SWITCH_POST_SECTION,
    };
}

export function _showAddPost(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_ADD_POST,
    };
}

export function _showSettings(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_SETTINGS,
    };
}

export function _showChannelList(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_CHANNEL_LIST,
    };
}

export function _showNotifications(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_NOTIFICATIONS,
    };
}

export function _showSearch(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_SEARCH,
    };
}

export function replaceViewState(newViewState: IViewStateStore): IJodelAction {
    return {
        payload: {newViewState},
        type: REPLACE_VIEW_STATE,
    };
}

export function receivePosts(section: Section,
                             postsBySortType: { [sortType: string]: IApiPostListPost[] },
                             append = false,
                             stickies?: IApiSticky[]): IJodelAction {
    const payload: {
        entities: Array<IApiPostListPost | IApiPostReplyPost>,
        postsBySortType: Array<{ sortType: PostListSortType, posts: string[] }>,
    } = {
        entities: [],
        postsBySortType: [],
    };

    if (postsBySortType.recent !== undefined) {
        payload.entities = payload.entities.concat(postsBySortType.recent);
        payload.postsBySortType.push({
            posts: postsBySortType.recent.map(post => post.post_id),
            sortType: PostListSortType.RECENT,
        });
    }
    if (postsBySortType.discussed !== undefined) {
        payload.entities = payload.entities.concat(postsBySortType.discussed);
        payload.postsBySortType.push({
            posts: postsBySortType.discussed.map(post => post.post_id),
            sortType: PostListSortType.DISCUSSED,
        });
    }
    if (postsBySortType.popular !== undefined) {
        payload.entities = payload.entities.concat(postsBySortType.popular);
        payload.postsBySortType.push({
            posts: postsBySortType.popular.map(post => post.post_id),
            sortType: PostListSortType.POPULAR,
        });
    }
    return {
        payload: {
            ...payload,
            append,
            section,
            stickies,
        },
        receivedAt: Date.now(),
        type: RECEIVE_POSTS,
    };
}

export function receivePost(post: IApiPostDetailsPost, append = false, nextReply: string | null = null,
                            shareable: boolean = false, ojFilter: boolean): IJodelAction {
    return {
        payload: {
            append,
            nextReply,
            ojFilter,
            post,
            shareable,
        },
        receivedAt: Date.now(),
        type: RECEIVE_POST,
    };
}

export function receiveNotifications(notifications: INotification[]): IJodelAction {
    return {
        payload: {
            notifications,
        },
        receivedAt: Date.now(),
        type: RECEIVE_NOTIFICATIONS,
    };
}

export function _setNotificationPostRead(postId: string): IJodelAction {
    return {
        payload: {
            postId,
        },
        type: SET_NOTIFICATION_POST_READ,
    };
}

export function pinnedPost(postId: string, pinned: boolean, pinCount: number): IJodelAction {
    return {
        payload: {
            pinCount,
            pinned,
            postId,
        },
        type: PINNED_POST,
    };
}

export function votedPost(postId: string, voted: VoteType, voteCount: number): IJodelAction {
    return {
        payload: {
            postId,
            voteCount,
            voted,
        },
        type: VOTED_POST,
    };
}

export function _selectPost(postId: string | null): IJodelAction {
    return {
        payload: {postId},
        type: SELECT_POST,
    };
}

export function _selectPicture(postId: string) {
    return {
        payload: {postId},
        type: SELECT_PICTURE,
    };
}

export function _setKarma(karma: number): IJodelAction {
    return {
        payload: {karma},
        type: SET_KARMA,
    };
}

export function _setConfig(config: IApiConfig): IJodelAction {
    return {
        payload: {config},
        type: SET_CONFIG,
    };
}

export function setRecommendedChannels(recommendedChannels: IChannel[]): IJodelAction {
    return {
        payload: {
            entitiesChannels: recommendedChannels,
        },
        type: SET_RECOMMENDED_CHANNELS,
    };
}

export function setLocalChannels(localChannels: IChannel[]): IJodelAction {
    return {
        payload: {
            entitiesChannels: localChannels,
        },
        type: SET_LOCAL_CHANNELS,
    };
}

export function setCountryChannels(countryChannels: IChannel[]): IJodelAction {
    return {
        payload: {
            entitiesChannels: countryChannels,
        },
        type: SET_COUNTRY_CHANNELS,
    };
}

export function setChannelsMeta(channels: IChannel[]): IJodelAction {
    return {
        payload: {
            entitiesChannels: channels,
        },
        type: SET_CHANNELS_META,
    };
}

export function setSuggestedHashtags(suggestedHashtags: string[]): IJodelAction {
    return {
        payload: {
            suggestedHashtags,
        },
        type: SET_SUGGESTED_HASHTAGS,
    };
}

export function _setDeviceUID(deviceUid: string): IJodelAction {
    return {
        payload: {deviceUid},
        type: SET_DEVICE_UID,
    };
}

export function _setPermissionDenied(permissionDenied: boolean): IJodelAction {
    return {
        payload: {permissionDenied},
        type: SET_PERMISSION_DENIED,
    };
}

export function beginRefreshToken(): IJodelAction {
    return {
        type: SET_TOKEN_PENDING,
    };
}

export function _setToken(distinctId: string, accessToken: string, refreshToken: string, expirationDate: number,
                          tokenType: TokenType): IJodelAction {
    return {
        payload: {
            token: {
                access: accessToken,
                distinctId,
                expirationDate,
                refresh: refreshToken,
                type: tokenType,
            },
        },
        type: SET_TOKEN,
    };
}

export function _setLocation(latitude: number, longitude: number, city = '', country = 'DE'): IJodelAction {
    return {
        payload: {
            location: {latitude, longitude, city, country},
        },
        type: SET_LOCATION,
    };
}

export function setUseBrowserLocation(useBrowserLocation: boolean): IJodelAction {
    return {
        payload: {
            useBrowserLocation,
        },
        type: SET_USE_BROWSER_LOCATION,
    };
}

export function setUseHomeLocation(useHomeLocation: boolean): IJodelAction {
    return {
        payload: {
            useHomeLocation,
        },
        type: SET_USE_HOME_LOCATION,
    };
}

export function invalidatePosts(section: Section): IJodelAction {
    return {
        payload: {section},
        type: INVALIDATE_POSTS,
    };
}

export function setIsFetching(section: Section, isFetching = true): IJodelAction {
    return {
        payload: {
            isFetching,
            section,
        },
        type: SET_IS_FETCHING,
    };
}

export function setImageCaptcha(key: string | null, imageUrl: string | null, imageWidth: number | null): IJodelAction {
    return {
        payload: {
            imageUrl,
            imageWidth,
            key,
        },
        type: SET_IMAGE_CAPTCHA,
    };
}

export function _closeSticky(stickyId: string): IJodelAction {
    return {
        payload: {
            stickyId,
        },
        type: CLOSE_STICKY,
    };
}
