import {combineReducers} from 'redux';
import {IChannel} from '../../interfaces/IChannel';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {IApiPost, IPost} from '../../interfaces/IPost';

import {PINNED_POST, RECEIVE_POSTS} from '../actions';
import {IJodelAppStore} from '../reducers';

export interface IEntitiesStore {
    posts: { [key: string]: IPost }
    channels: { [key: string]: IChannel }
}

export const entities = combineReducers({
    posts,
    channels,
});

function convertApiPostToPost(post: IApiPost): IPost {
    const newChildren = post.children ? post.children.map(child => child.post_id) : undefined;
    return {...post, children: newChildren};
}

function posts(state: { [key: string]: IPost } = {}, action: IJodelAction): typeof state {
    const payload = action.payload;
    if (payload && payload.entities !== undefined) {
        let newState: typeof state = {};
        payload.entities.forEach((post: IApiPost) => {
            if (post.children) {
                post.children.forEach((child: IApiPost) => newState[child.post_id] = convertApiPostToPost(child));
            }

            const oldPost = state[post.post_id];
            let newPost = convertApiPostToPost(post);
            if (oldPost && oldPost.children && newPost.children) {
                if (payload.append === true) {
                    newPost = {
                        ...newPost,
                        child_count: (newPost.child_count ? newPost.child_count : 0) + (oldPost.children ? oldPost.children.length : 0),
                        children: [...oldPost.children, ...newPost.children],
                    };
                } else if (newPost.children && newPost.children.length == 0) {
                    // The old post has children and the new post has children, which however aren't included in the new data
                    // -> keep old children
                    newPost = {...newPost, children: oldPost.children};
                }
            }
            newState[post.post_id] = newPost;
        });
        state = {...state, ...newState};
    }
    switch (action.type) {
    case PINNED_POST:
        if (!payload || !payload.postId) {
            return state;
        }
        return {
            ...state,
            [payload.postId]: {
                ...state[payload.postId],
                pinned: payload.pinned,
                pin_count: payload.pinCount,
            },
        };
    default:
        return state;
    }
}

function channels(state: { [key: string]: IChannel } = {}, action: IJodelAction): typeof state {
    if (action.payload && action.payload.entitiesChannels !== undefined) {
        let newState: typeof state = {};
        action.payload.entitiesChannels.forEach((channel) => {
            newState[channel.channel] = channel;
        });
        state = {
            ...state,
            ...newState,
        };
    }
    switch (action.type) {
    case RECEIVE_POSTS:
        if (!action.payload) {
            return state;
        }
        if (action.payload.section !== undefined && action.payload.section.startsWith('channel:')) {
            let channelName = action.payload.section.substring(8);
            return {
                ...state,
                [channelName]: {
                    ...state[channelName],
                    unread: false,
                },
            };
        }
        return state;
    default:
        return state;
    }
}

export function getPost(state: IJodelAppStore, postId: string): IPost | null {
    return state.entities.posts[postId] || null;
}

export function getChannel(state: IJodelAppStore, channel: string): IChannel {
    let c = state.entities.channels[channel];
    if (c === undefined) {
        return {channel};
    }
    return c;
}
