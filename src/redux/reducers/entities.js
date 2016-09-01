import Immutable from "immutable";
import {PINNED_POST, RECEIVE_POSTS} from "../actions";

function entitiesPost(state = Immutable.Map(), action) {
    if (action.entities !== undefined) {
        let newState = {};
        action.entities.forEach((post) => {
            if (post.children !== undefined) {
                post.children = post.children.map(child => {
                    newState[child.post_id] = child;
                    return child.post_id;
                })
            }
            if (state.has(post.post_id)) {
                const oldPost = state.get(post.post_id);
                if (oldPost.has("children") && post.children !== undefined && post.children.length == 0) {
                    // The old post has children and the new post has children, which however aren't included in the new data
                    // -> keep old children
                    post.children = oldPost.get("children");
                }
            }
            newState[post.post_id] = post;
        });
        state = state.merge(newState);
    }
    switch (action.type) {
        case PINNED_POST:
            return state.update(action.postId, post => post.set("pinned", action.pinned).set("pin_count", action.pinCount));
        default:
            return state;
    }
}

function entitiesChannel(state = Immutable.Map(), action) {
    if (action.entitiesChannel !== undefined) {
        let newState = {};
        action.entitiesChannel.forEach((channel) => {
            newState[channel.channel] = channel;
        });
        state = state.mergeDeep(newState);
    }
    switch (action.type) {
        case RECEIVE_POSTS:
            if (action.section !== undefined && action.section.startsWith("channel:")) {
                let channel = action.section.substring(8);
                return state.setIn([channel, "unread"], false);
            }
            return state;
        default:
            return state;
    }
}

function entities(state = Immutable.Map(), action) {
    state = state.update("posts", posts => entitiesPost(posts, action));
    state = state.update("channels", channels => entitiesChannel(channels, action));
    return state;
}

export default entities;

export function getPost(state, postId) {
    return state.entities.getIn(["posts", postId]);
}

export function getChannel(state, channel) {
    let c = state.entities.getIn(["channels", channel]);
    if (c === undefined) {
        return Immutable.Map({channel});
    }
    return c;
}