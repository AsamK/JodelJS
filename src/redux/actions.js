import {
    apiGetPostsCombo,
    apiGetPost,
    apiUpVote,
    apiDownVote,
    apiSetPlace,
    apiAddPost,
    apiGetPostsMineCombo,
    apiGetPostsRecent
} from "../app/api";

/*
 * action types
 */
export const NEW_POSTS = 'NEW_POSTS';

/*
 * other constants
 */

export const PostListContainerStates = {
    RECENT: 'RECENT',
    DISCUSSED: 'DISCUSSED',
    POPULAR: 'POPULAR'
};

/*
 * action creators
 */

export function upVote(postId, parentPostId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiUpVote(postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post, parentPostId))
            }
        });
    }
}

export function downVote(postId, parentPostId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiDownVote(postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post, parentPostId))
            }
        });
    }
}

export const REQUEST_POSTS_LOCATION = 'REQUEST_POSTS_LOCATION';
function requestPostsLocation() {
    return {
        type: REQUEST_POSTS_LOCATION,
        subreddit
    }
}

export const SWITCH_POST_LIST_CONTAINER_STATE = 'SWITCH_POST_LIST_CONTAINER_STATE';
export function switchPostListContainerState(state) {
    return {
        type: SWITCH_POST_LIST_CONTAINER_STATE,
        state
    }
}

export const SWITCH_POST_SECTION = 'SWITCH_POST_SECTION';
export function switchPostSection(section) {
    return {
        type: SWITCH_POST_SECTION,
        section,
    }
}

export const SHOW_ADD_POST = 'SHOW_ADD_POST';
export function showAddPost(visible, ancestor) {
    return {
        type: SHOW_ADD_POST,
        visible,
        ancestor,
    }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
function receivePosts(section, recent, discussed, popular) {
    let posts = {};
    recent.forEach(post => posts[post.post_id] = post);
    discussed.forEach(post => posts[post.post_id] = post);
    popular.forEach(post => posts[post.post_id] = post);
    return {
        type: RECEIVE_POSTS,
        section,
        postsRecent: recent.map(post => post.post_id),
        postsDiscussed: discussed.map(post => post.post_id),
        postsPopular: popular.map(post => post.post_id),
        entities: recent.concat(discussed).concat(popular),
        receivedAt: Date.now()
    }
}

function receivePostsAppend(section, listType, items) {
    let posts = {};
    items.forEach(post => posts[post.post_id] = post);
    return {
        type: RECEIVE_POSTS,
        section,
        listType,
        append: true,
        posts: items.map(post => post.post_id),
        entities: items,
        receivedAt: Date.now()
    }
}

function receivePost(post, ancestor) {
    return {
        type: RECEIVE_POSTS,
        entities: [post],
        ancestor,
        receivedAt: Date.now()
    }
}

export const SELECT_POST = 'SELECT_POST';
function _selectPost(postId) {
    return {
        type: SELECT_POST,
        postId: postId,
        receivedAt: Date.now()
    }
}

export const SET_LOCATION = 'SET_LOCATION';
function setLocation(latitude, longitude) {
    return {
        type: SET_LOCATION,
        location: {latitude: latitude, longitude: longitude},
        receivedAt: Date.now()
    }
}

export const INVALIDATE_POSTS = 'INVALIDATE_POSTS';
function invalidatePosts(section) {
    return {
        section,
        type: INVALIDATE_POSTS,
    }
}

export const SET_IS_FETCHING = 'SET_IS_FETCHING';
function setIsFetching(section) {
    return {
        section,
        type: SET_IS_FETCHING,
    }
}

function shouldFetchPosts(section, state) {
    const posts = state.postsBySection[section];
    if (!posts) {
        return true
    } else if (posts.isFetching) {
        return false
    } else {
        return posts.didInvalidate
    }
}

export function fetchPostsIfNeeded(section) {
    return (dispatch, getState) => {
        if (section === undefined) {
            section = getState().viewState.postSection;
        }
        if (shouldFetchPosts(section, getState())) {
            dispatch(setIsFetching(section));
            switch (section) {
                case "location":
                    apiGetPostsCombo(getState().viewState.location.latitude, getState().viewState.location.longitude, (err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, res.body.recent, res.body.replied, res.body.voted))
                        }
                    });
                    break;
                case "mine":
                    apiGetPostsMineCombo((err, res) => {
                        if (err == null && res != null) {
                            dispatch(receivePosts(section, res.body.recent, res.body.replied, res.body.voted))
                        }
                    });
                    break;
            }
        }
    }
}

export function fetchMorePosts(section, listType) {
    return (dispatch, getState) => {
        if (section === undefined) {
            section = getState().viewState.postSection;
        }
        if (listType === undefined) {
            listType = getState().viewState.postListContainerState;
        }
        if (getState().postsBySection[section] == undefined || getState().postsBySection[section].isFetching) {
            return;
        }
        switch (section) {
            case "location":
                switch (listType) {
                    case "RECENT":
                        const items = getState().postsBySection[section].itemsRecent;
                        let afterId;
                        if (items) {
                            afterId = items[items.length - 1];
                        }
                        dispatch(setIsFetching(section));
                        apiGetPostsRecent(afterId, getState().viewState.location.latitude, getState().viewState.location.longitude, (err, res) => {
                            if (err == null && res != null) {
                                dispatch(receivePostsAppend(section, listType, res.body.posts));
                            }
                        });
                        break;
                }
                break;
            case "mine":

        }
    }
}

export function updatePosts() {
    return (dispatch, getState) => {
        const section = getState().viewState.postSection;
        dispatch(invalidatePosts(section));
        dispatch(fetchPostsIfNeeded(section));
    }
}


export function fetchPost(postId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiGetPost(postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body))
            }
        });
    }
}

export function selectPost(postId) {
    return (dispatch, getState) => {
        dispatch(_selectPost(postId));
        // Dispatch a thunk from thunk!
        if (postId != null) {
            dispatch(fetchPost(postId));
        }
    }
}

export function updateLocation() {
    return (dispatch, getState) => {
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(function (position) {
                if (getState().viewState.location.latitude != position.coords.latitude &&
                    getState().viewState.location.longitude != position.coords.longitude) {
                    apiSetPlace(position.coords.latitude, position.coords.longitude, "Nimmerland", "DE");
                    dispatch(setLocation(position.coords.latitude, position.coords.longitude));
                    dispatch(updatePosts());
                }
            });
        }
    }
}

export function addPost(text, ancestor, color = "FF9908") {
    return (dispatch, getState) => {
        dispatch(showAddPost(false));
        let loc = getState().viewState.location;
        apiAddPost(ancestor, color, 0.0, loc.latitude, loc.longitude, "Nimmerland", "DE", text, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePosts("location", res.body.posts, [], []))
            }
        });
    }
}
