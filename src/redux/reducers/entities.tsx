import {combineReducers} from 'redux';
import {IApiPostReplyPost} from '../../interfaces/IApiPostDetailsPost';
import {IApiPostListPost} from '../../interfaces/IApiPostListPost';
import {IApiSticky} from '../../interfaces/IApiSticky';
import {IChannel} from '../../interfaces/IChannel';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INotification} from '../../interfaces/INotification';
import {IPost} from '../../interfaces/IPost';

import {PINNED_POST, RECEIVE_POSTS} from '../actions';
import {
    CLOSE_STICKY,
    RECEIVE_NOTIFICATIONS,
    RECEIVE_POST,
    SET_NOTIFICATION_POST_READ,
    VOTED_POST,
} from '../actions/state';
import {IJodelAppStore} from '../reducers';

export interface IEntitiesStore {
    posts: { [key: string]: IPost };
    channels: { [key: string]: IChannel };
    notifications: INotification[];
    stickies: IApiSticky[];
}

export const entities = combineReducers({
    channels,
    notifications,
    posts,
    stickies,
});

function convertApiReplyPostToReplyPost(replies: IApiPostReplyPost[]): string[] | undefined {
    if (!replies) {
        return undefined;
    }
    const seen: { [key: string]: boolean } = {};
    return replies.map(child => child.post_id)
        .filter(c => seen[c] ? false : (seen[c] = true));
}

function posts(state: { [key: string]: IPost } = {}, action: IJodelAction): typeof state {
    const payload = action.payload;
    if (payload && payload.entities !== undefined) {
        const newState: typeof state = {};
        payload.entities.forEach((post): void => {
            const postChildren = (post as IApiPostListPost).children || undefined;
            if (postChildren && postChildren.length > 0) {
                console.warn('Received a post with unexpected children: ', post.post_id);
            }

            const oldPost = state[post.post_id];
            newState[post.post_id] = {
                ...oldPost,
                ...post,
                children: oldPost ? oldPost.children : [],
            };
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
                    pin_count: payload.pinCount,
                    pinned: payload.pinned,
                },
            };
        case VOTED_POST:
            if (!payload || !payload.postId || payload.voteCount === undefined) {
                return state;
            }
            return {
                ...state,
                [payload.postId]: {
                    ...state[payload.postId],
                    vote_count: payload.voteCount,
                    voted: payload.voted,
                },
            };
        case RECEIVE_POST:
            if (!payload || !payload.post) {
                return state;
            }
            const childrenEntities: typeof state = {};
            const post = payload.post;
            const postChildren = post.children;

            if (postChildren) {
                postChildren.forEach(child => childrenEntities[child.post_id] = child);
            }

            const oldPost = state[post.post_id];
            const newPost = {
                ...oldPost,
                ...post,
                children: convertApiReplyPostToReplyPost(postChildren),
                next_reply: payload.nextReply,
                shareable: payload.shareable,
            };
            if (oldPost && oldPost.children && newPost.children) {
                if (payload.append === true) {
                    newPost.child_count = (newPost.child_count ? newPost.child_count : 0) +
                        (oldPost.children ? oldPost.children.length : 0);
                    newPost.children = [...oldPost.children, ...newPost.children];
                } else if (newPost.children && newPost.children.length === 0) {
                    // The old post has children and the new post has children,
                    // which however aren't included in the new data
                    // -> keep old children
                    newPost.children = oldPost.children;
                }
            }
            return {
                ...state,
                ...childrenEntities,
                [post.post_id]: newPost,
            };
        default:
            return state;
    }
}

function channels(state: { [key: string]: IChannel } = {}, action: IJodelAction): typeof state {
    if (action.payload && action.payload.entitiesChannels !== undefined) {
        const newState: typeof state = {};
        action.payload.entitiesChannels.forEach(channel => {
            newState[channel.channel] = {...state[channel.channel], ...channel};
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
                const channelName = action.payload.section.substring(8);
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

function notifications(state: INotification[] = [], action: IJodelAction): typeof state {
    if (!action.payload) {
        return state;
    }
    switch (action.type) {
        case RECEIVE_NOTIFICATIONS:
            return action.payload.notifications ? action.payload.notifications : [];
        case SET_NOTIFICATION_POST_READ:
            const postId = action.payload.postId;
            return state.map(n => postId === n.post_id ? {...n, read: true} : n);
        default:
            return state;
    }
}

function stickies(state: IApiSticky[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS:
            if (!action.payload || !action.payload.stickies) {
                return state;
            }
            return action.payload.stickies;
        case CLOSE_STICKY:
            if (!action.payload || !action.payload.stickyId) {
                return state;
            }
            const stickyId = action.payload.stickyId;
            return state.filter(sticky => sticky.stickypost_id !== stickyId);
        default:
            return state;
    }
}

export function getPost(state: IJodelAppStore, postId: string): IPost | null {
    return state.entities.posts[postId] || null;
}

export function getChannel(state: IJodelAppStore, channel: string): IChannel {
    const c = state.entities.channels[channel];
    if (c === undefined) {
        return {channel};
    }
    return c;
}
