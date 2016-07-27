import {apiGetPostsCombo, apiGetPost, apiUpVote, apiDownVote, apiSetPlace} from "../app/api";

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

export function upVote(postId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiUpVote(postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post))
            }
        });
    }
}

export function downVote(postId) {
    return (dispatch, getState) => {
        // Dispatch a thunk from thunk!
        apiDownVote(postId, (err, res) => {
            if (err == null && res != null) {
                dispatch(receivePost(res.body.post))
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

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
function receiveLocationPosts(recent, discussed, popular) {
    let posts = {};
    recent.forEach(post => posts[post.post_id] = post);
    discussed.forEach(post => posts[post.post_id] = post);
    popular.forEach(post => posts[post.post_id] = post);
    return {
        type: RECEIVE_POSTS,
        postsLocationRecent: recent.map(post => post.post_id),
        postsLocationDiscussed: discussed.map(post => post.post_id),
        postsLocationPopular: popular.map(post => post.post_id),
        entities: recent.concat(discussed).concat(popular),
        receivedAt: Date.now()
    }
}

function receivePost(post) {
    return {
        type: RECEIVE_POSTS,
        entities: [post],
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
function invalidatePosts() {
    return {
        type: INVALIDATE_POSTS,
    }
}

function shouldFetchPosts(state) {
    const posts = state.postsLocation;
    if (!posts) {
        return true
    } else if (posts.isFetching) {
        return false
    } else {
        return posts.didInvalidate
    }
}

export function fetchPostsIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchPosts(getState())) {
            console.log(getState());
            apiGetPostsCombo(getState().viewState.location.latitude, getState().viewState.location.longitude, (err, res) => {
                if (err == null && res != null) {
                    dispatch(receiveLocationPosts(res.body.recent, res.body.replied, res.body.voted))
                }
            });
        }
    }
}

export function updatePosts() {
    return (dispatch, getState) => {
        dispatch(invalidatePosts());
        dispatch(fetchPostsIfNeeded());
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