import Immutable from "immutable";

function entities(state = Immutable.Map({}), action) {
    if (action.entities === undefined) {
        return state;
    }
    let newState = {};
    action.entities.forEach((post) => {
        if (post.children !== undefined) {
            post.children = post.children.map(child => {
                newState[child.post_id] = child;
                return child.post_id;
            })
        }
        if (state.hasOwnProperty(post.post_id)) {
            const oldPost = state[post.post_id];
            if (oldPost.children !== undefined && post.children !== undefined && post.children.length == 0) {
                // The old post has children and the new post has children, which however aren't included in the new data
                // -> keep old children
                post.children = oldPost.children;
            }
        }
        newState[post.post_id] = post;
    });
    return state.mergeDeep(newState);
}

export default entities;
