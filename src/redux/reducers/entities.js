import Immutable from "immutable";
import {PINNED_POST} from "../actions";

function entities(state = Immutable.Map({}), action) {
    if (action.entities === undefined) {
        switch (action.type) {
            case PINNED_POST:
                return state.update(action.postId, post => post.set("pinned", action.pinned).set("pin_count", action.pinCount));
                break;
            default:
                return state;
        }
    }
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
    return state.merge(newState);
}

export default entities;
