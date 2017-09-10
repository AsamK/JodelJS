import {PostListSortType} from '../../enums/PostListSortType';
import {Section} from '../../enums/Section';
import {IChannel} from '../../interfaces/IChannel';
import {IConfig} from '../../interfaces/IConfig';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INotification} from '../../interfaces/INotification';
import {IApiPost} from '../../interfaces/IPost';
import {IViewStateStore} from '../reducers/viewState';

export const SWITCH_POST_LIST_SORT_TYPE = 'SWITCH_POST_LIST_CONTAINER_STATE';

export function _switchPostListSortType(sortType: PostListSortType): IJodelAction {
    return {
        payload: {sortType},
        type: SWITCH_POST_LIST_SORT_TYPE,
    };
}

export const SWITCH_POST_SECTION = 'SWITCH_POST_SECTION';

export function _switchPostSection(section: Section): IJodelAction {
    return {
        payload: {section},
        type: SWITCH_POST_SECTION,
    };
}

export const SHOW_ADD_POST = 'SHOW_ADD_POST';

export function _showAddPost(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_ADD_POST,
    };
}

export const SHOW_SETTINGS = 'SHOW_SETTINGS';

export function _showSettings(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_SETTINGS,
    };
}

export const SHOW_CHANNEL_LIST = 'SHOW_CHANNEL_LIST';

export function _showChannelList(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_CHANNEL_LIST,
    };
}

export const SHOW_NOTIFICATIONS = 'SHOW_NOTIFICATIONS';

export function _showNotifications(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_NOTIFICATIONS,
    };
}

export const SHOW_SEARCH = 'SHOW_SEARCH';

export function _showSearch(visible: boolean): IJodelAction {
    return {
        payload: {visible},
        type: SHOW_SEARCH,
    };
}

export const REPLACE_VIEW_STATE = 'REPLACE_VIEW_STATE';

export function replaceViewState(newViewState: IViewStateStore): IJodelAction {
    return {
        payload: {newViewState},
        type: REPLACE_VIEW_STATE,
    };
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';

export function receivePosts(section: Section, postsBySortType: { [sortType: string]: IApiPost[] },
                             append = false): IJodelAction {
    const payload: {
        append: boolean,
        entities: IApiPost[],
        postsBySortType: Array<{ sortType: PostListSortType, posts: string[] }>,
        section: Section,
    } = {
        append,
        entities: [],
        postsBySortType: [],
        section,
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
        payload,
        receivedAt: Date.now(),
        type: RECEIVE_POSTS,
    };
}

export function receivePost(post: IApiPost, append = false): IJodelAction {
    return {
        payload: {
            append,
            entities: [post],
        },
        receivedAt: Date.now(),
        type: RECEIVE_POSTS,
    };
}

export const RECEIVE_NOTIFICATIONS = 'RECEIVE_NOTIFICATIONS';

export function receiveNotifications(notifications: INotification[]): IJodelAction {
    return {
        payload: {
            notifications,
        },
        receivedAt: Date.now(),
        type: RECEIVE_NOTIFICATIONS,
    };
}

export const SET_NOTIFICATION_POST_READ = 'SET_NOTIFICATION_POST_READ';

export function _setNotificationPostRead(postId: string): IJodelAction {
    return {
        payload: {
            postId,
        },
        receivedAt: Date.now(),
        type: SET_NOTIFICATION_POST_READ,
    };
}

export const PINNED_POST = 'PINNED_POST';

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

export const SELECT_POST = 'SELECT_POST';

export function _selectPost(postId: string | null): IJodelAction {
    return {
        payload: {postId},
        type: SELECT_POST,
    };
}

export const SELECT_PICTURE = 'SELECT_PICTURE';

export function _selectPicture(postId: string) {
    return {
        payload: {postId},
        type: SELECT_PICTURE,
    };
}

export const SET_KARMA = 'SET_KARMA';

export function _setKarma(karma: number): IJodelAction {
    return {
        payload: {karma},
        receivedAt: Date.now(),
        type: SET_KARMA,
    };
}

export const SET_CONFIG = 'SET_CONFIG';

export function _setConfig(config: IConfig): IJodelAction {
    return {
        payload: {config},
        receivedAt: Date.now(),
        type: SET_CONFIG,
    };
}

export const SET_RECOMMENDED_CHANNELS = 'SET_RECOMMENDED_CHANNELS';

export function setRecommendedChannels(recommendedChannels: IChannel[]): IJodelAction {
    return {
        payload: {
            channelNames: recommendedChannels.map(c => c.channel),
            entitiesChannels: recommendedChannels,
        },
        type: SET_RECOMMENDED_CHANNELS,
    };
}

export const SET_LOCAL_CHANNELS = 'SET_LOCAL_CHANNELS';

export function setLocalChannels(localChannels: IChannel[]): IJodelAction {
    return {
        payload: {
            channelNames: localChannels.map(c => c.channel),
            entitiesChannels: localChannels,
        },
        type: SET_LOCAL_CHANNELS,
    };
}

export const SET_CHANNELS_META = 'SET_CHANNELS_META';

export function setChannelsMeta(channels: IChannel[]): IJodelAction {
    return {
        payload: {
            entitiesChannels: channels,
        },
        type: SET_CHANNELS_META,
    };
}

export const SET_SUGGESTED_HASHTAGS = 'SET_LOCAL_CHANNELS';

export function setSuggestedHashtags(suggestedHashtags: string[]): IJodelAction {
    return {
        payload: {
            suggestedHashtags,
        },
        type: SET_LOCAL_CHANNELS,
    };
}

export const SET_DEVICE_UID = 'SET_DEVICE_UID';

export function _setDeviceUID(deviceUid: string): IJodelAction {
    return {
        payload: {deviceUid},
        type: SET_DEVICE_UID,
    };
}

export const SET_PERMISSION_DENIED = 'SET_PERMISSION_DENIED';

export function _setPermissionDenied(permissionDenied: boolean): IJodelAction {
    return {
        payload: {permissionDenied},
        type: SET_PERMISSION_DENIED,
    };
}

export const SET_TOKEN = 'SET_TOKEN';

export function _setToken(distinctId: string, accessToken: string, refreshToken: string, expirationDate: number,
                          tokenType: string): IJodelAction {
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

export const SET_LOCATION = 'SET_LOCATION';

export function _setLocation(latitude: number, longitude: number, city = '', country = 'DE'): IJodelAction {
    return {
        payload: {
            location: {latitude, longitude, city, country},
        },
        receivedAt: Date.now(),
        type: SET_LOCATION,
    };
}

export const SET_USE_BROWSER_LOCATION = 'SET_USE_BROWSER_LOCATION';

export function setUseBrowserLocation(useBrowserLocation: boolean): IJodelAction {
    return {
        payload: {
            useBrowserLocation,
        },
        receivedAt: Date.now(),
        type: SET_USE_BROWSER_LOCATION,
    };
}

export const SET_USE_HOME_LOCATION = 'SET_USE_HOME_LOCATION';

export function setUseHomeLocation(useHomeLocation: boolean): IJodelAction {
    return {
        payload: {
            useHomeLocation,
        },
        receivedAt: Date.now(),
        type: SET_USE_HOME_LOCATION,
    };
}

export const INVALIDATE_POSTS = 'INVALIDATE_POSTS';

export function invalidatePosts(section: Section): IJodelAction {
    return {
        payload: {section},
        type: INVALIDATE_POSTS,
    };
}

export const SET_IS_FETCHING = 'SET_IS_FETCHING';

export function setIsFetching(section: Section, isFetching = true): IJodelAction {
    return {
        payload: {
            isFetching,
            section,
        },
        type: SET_IS_FETCHING,
    };
}

export const SET_IMAGE_CAPTCHA = 'SET_IMAGE_CAPTCHA';

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
