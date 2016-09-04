export const PostListSortTypes = {
    RECENT: 'recent',
    DISCUSSED: 'discussed',
    POPULAR: 'popular'
};

export const SWITCH_POST_LIST_SORT_TYPE = 'SWITCH_POST_LIST_CONTAINER_STATE';
export function _switchPostListSortType(sortType) {
    return {
        type: SWITCH_POST_LIST_SORT_TYPE,
        sortType
    }
}

export const SWITCH_POST_SECTION = 'SWITCH_POST_SECTION';
export function _switchPostSection(section) {
    return {
        type: SWITCH_POST_SECTION,
        section,
    }
}

export const SHOW_ADD_POST = 'SHOW_ADD_POST';
export function _showAddPost(visible) {
    return {
        type: SHOW_ADD_POST,
        visible,
    }
}

export const SHOW_SETTINGS = 'SHOW_SETTINGS';
export function _showSettings(visible) {
    return {
        type: SHOW_SETTINGS,
        visible,
    }
}

export const SHOW_CHANNEL_LIST = 'SHOW_CHANNEL_LIST';
export function _showChannelList(visible) {
    return {
        type: SHOW_CHANNEL_LIST,
        visible,
    }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export function receivePosts(section, postsBySortType, append = false) {
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

export function receivePost(post) {
    return {
        type: RECEIVE_POSTS,
        entities: [post],
        receivedAt: Date.now(),
        append: true,
    }
}

export const PINNED_POST = 'PINNED_POST';
export function pinnedPost(postId, pinned, pinCount) {
    return {
        type: PINNED_POST,
        postId,
        pinned,
        pinCount,
    }
}

export const SELECT_POST = 'SELECT_POST';
export function _selectPost(postId) {
    return {
        type: SELECT_POST,
        postId: postId,
    }
}

export const SELECT_PICTURE = 'SELECT_PICTURE';
export function _selectPicture(postId) {
    return {
        type: SELECT_PICTURE,
        postId: postId,
    }
}


export const SET_KARMA = 'SET_KARMA';
export function _setKarma(karma) {
    return {
        type: SET_KARMA,
        karma,
        receivedAt: Date.now()
    }
}

export const SET_CONFIG = 'SET_CONFIG';
export function _setConfig(config) {
    return {
        type: SET_CONFIG,
        config,
        receivedAt: Date.now()
    }
}

export const SET_RECOMMENDED_CHANNELS = 'SET_RECOMMENDED_CHANNELS';
export function setRecommendedChannels(recommendedChannels) {
    return {
        type: SET_RECOMMENDED_CHANNELS,
        recommendedChannels,
        entitiesChannel: recommendedChannels,
    }
}

export const SET_CHANNELS_META = 'SET_CHANNELS_META';
export function setChannelsMeta(channels) {
    return {
        type: SET_CHANNELS_META,
        entitiesChannel: channels,
    }
}

export const SET_DEVICE_UID = 'SET_DEVICE_UID';
export function _setDeviceUID(deviceUid) {
    return {
        type: SET_DEVICE_UID,
        deviceUid,
    }
}

export const SET_PERMISSION_DENIED = 'SET_PERMISSION_DENIED';
export function _setPermissionDenied(permissionDenied) {
    return {
        type: SET_PERMISSION_DENIED,
        permissionDenied,
    }
}

export const SET_TOKEN = 'SET_TOKEN';
export function _setToken(distinctId, accessToken, refreshToken, expirationDate, tokenType) {
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
export function _setLocation(latitude, longitude, city, country = "DE") {
    return {
        type: SET_LOCATION,
        location: {latitude, longitude, city, country},
        receivedAt: Date.now()
    }
}

export const SET_USE_BROWSER_LOCATION = 'SET_USE_BROWSER_LOCATION';
export function setUseBrowserLocation(useBrowserLocation) {
    return {
        type: SET_USE_BROWSER_LOCATION,
        useBrowserLocation,
        receivedAt: Date.now()
    }
}

export const INVALIDATE_POSTS = 'INVALIDATE_POSTS';
export function invalidatePosts(section) {
    return {
        section,
        type: INVALIDATE_POSTS,
    }
}

export const SET_IS_FETCHING = 'SET_IS_FETCHING';
export function setIsFetching(section, isFetching = true) {
    return {
        section,
        isFetching,
        type: SET_IS_FETCHING,
    }
}
