import * as Immutable from 'immutable';
import {combineReducers} from 'redux';

import {PINNED_POST, RECEIVE_POSTS} from '../actions';
import {IJodelAppStore} from '../reducers';

export interface IEntitiesStore {
    posts: any
    channels: any
}
export const entities = combineReducers({
    posts,
    channels,
});

function posts(state = Immutable.Map<string, any>(), action) {
    if (action.payload && action.payload.entities !== undefined) {
        let newState = {};
        action.payload.entities.forEach((post) => {
            if (post.children !== undefined) {
                post.children = post.children.map(child => {
                    newState[child.post_id] = child;
                    return child.post_id;
                });
            }
            if (state.has(post.post_id)) {
                const oldPost = state.get(post.post_id);
                if (oldPost.has('children') && post.children !== undefined) {
                    if (action.append === true) {
                        post.child_count += oldPost.get('children').count();
                        post.children = oldPost.get('children').concat(post.children);
                    } else if (post.children.length == 0) {
                        // The old post has children and the new post has children, which however aren't included in the new data
                        // -> keep old children
                        post.children = oldPost.get('children');
                    }
                }
            }
            newState[post.post_id] = post;
        });
        state = state.merge(newState);
    }
    switch (action.type) {
    case PINNED_POST:
        return state.update(action.postId, post => post.set('pinned', action.pinned).set('pin_count', action.pinCount));
    default:
        return state;
    }
}

function channels(state = Immutable.Map(), action) {
    if (action.channels !== undefined) {
        let newState = {};
        action.channels.forEach((channel) => {
            newState[channel.channels] = channel;
        });
        state = state.mergeDeep(newState);
    }
    switch (action.type) {
    case RECEIVE_POSTS:
        if (action.payload.section !== undefined && action.payload.section.startsWith('channel:')) {
            let channel = action.payload.section.substring(8);
            return state.setIn([channel, 'unread'], false);
        }
        return state;
    default:
        return state;
    }
}

export function getPost(state: IJodelAppStore, postId: string) {
    return state.entities.posts.get(postId);
}

export function getChannel(state: IJodelAppStore, channel: string) {
    let c = state.entities.channels.get(channel);
    if (c === undefined) {
        return Immutable.Map({channel});
    }
    return c;
}