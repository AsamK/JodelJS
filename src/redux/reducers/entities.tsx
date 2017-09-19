import {combineReducers} from 'redux';

import {IApiPostReplyPost} from '../../interfaces/IApiPostDetailsPost';
import {IApiPostListPost} from '../../interfaces/IApiPostListPost';
import {IApiSticky} from '../../interfaces/IApiSticky';
import {IChannel} from '../../interfaces/IChannel';
import {IJodelAction} from '../../interfaces/IJodelAction';
import {INotification} from '../../interfaces/INotification';
import {IPost} from '../../interfaces/IPost';
import {
    CLOSE_STICKY,
    PINNED_POST,
    RECEIVE_NOTIFICATIONS,
    RECEIVE_POST,
    RECEIVE_POSTS,
    SET_CHANNELS_META,
    SET_COUNTRY_CHANNELS,
    SET_LOCAL_CHANNELS,
    SET_NOTIFICATION_POST_READ,
    SET_RECOMMENDED_CHANNELS,
    VOTED_POST,
} from '../actions/action.consts';
import {IJodelAppStore} from '../reducers';

export interface IEntitiesStore {
    readonly posts: { readonly [key: string]: IPost };
    readonly channels: { readonly [key: string]: IChannel };
    readonly notifications: ReadonlyArray<INotification>;
    readonly stickies: ReadonlyArray<IApiSticky>;
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

function posts(state: { readonly [key: string]: IPost } = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS: {
            const newState: { [key: string]: IPost } = {};
            action.payload.entities.forEach((post): void => {
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
            return {...state, ...newState};
        }
        case PINNED_POST:
            return {
                ...state,
                [action.payload.postId]: {
                    ...state[action.payload.postId],
                    pin_count: action.payload.pinCount,
                    pinned: action.payload.pinned,
                },
            };
        case VOTED_POST:
            return {
                ...state,
                [action.payload.postId]: {
                    ...state[action.payload.postId],
                    vote_count: action.payload.voteCount,
                    voted: action.payload.voted,
                },
            };
        case RECEIVE_POST: {
            const childrenEntities: { [key: string]: IPost } = {};
            const post = action.payload.post;
            const postChildren = post.children;

            if (postChildren) {
                postChildren.forEach(child => childrenEntities[child.post_id] = child);
            }

            const oldPost = state[post.post_id];
            const newPost = {
                ...oldPost,
                ...post,
                children: convertApiReplyPostToReplyPost(postChildren),
                next_reply: action.payload.nextReply,
                shareable: action.payload.shareable,
            };
            if (oldPost && oldPost.children && newPost.children) {
                if (action.payload.append === true) {
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
        }
        default:
            return state;
    }
}

function channels(state: { readonly [key: string]: IChannel } = {}, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_RECOMMENDED_CHANNELS:
        case SET_LOCAL_CHANNELS:
        case SET_COUNTRY_CHANNELS:
        case SET_CHANNELS_META:
            const newState: { [key: string]: IChannel } = {};
            action.payload.entitiesChannels.forEach(channel => {
                newState[channel.channel] = {...state[channel.channel], ...channel};
            });
            return {
                ...state,
                ...newState,
            };
        case RECEIVE_POSTS:
            if (action.payload.section.startsWith('channel:')) {
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

function notifications(state: ReadonlyArray<INotification> = [], action: IJodelAction): typeof state {
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

function stickies(state: ReadonlyArray<IApiSticky> = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case RECEIVE_POSTS:
            if (!action.payload.stickies) {
                return state;
            }
            return action.payload.stickies;
        case CLOSE_STICKY:
            const stickyId = action.payload.stickyId;
            return state.filter(sticky => sticky.stickypost_id !== stickyId);
        default:
            return state;
    }
}

export function getPost(state: IJodelAppStore, postId: string): IPost | null {
    return state.entities.posts[postId] || null;
}
