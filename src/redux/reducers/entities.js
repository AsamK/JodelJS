function entities(state = {}, action) {
    if (action.entities) {
        let newState = Object.assign({}, state);
        if (action.ancestor != undefined) {
            // We get child items, replace children, but don't add new ones, which shouldn't happen anyway
            let parent = Object.assign({}, state[action.ancestor]);
            action.entities.forEach((post) => {
                parent.children = parent.children.map(child => child.post_id === post.post_id ? post : child);
            });
            newState[action.ancestor] = parent;
        } else {
            action.entities.forEach((post) => {
                if (newState.hasOwnProperty(post.post_id)) {
                    const oldPost = newState[post.post_id];
                    if (oldPost.children != undefined && post.children != undefined && post.children.length == 0) {
                        // The old post has children and the new post has children, which however aren't included in the new data
                        // -> keep old children
                        post.children = oldPost.children;
                        post.child_count = oldPost.child_count;
                    }
                }
                newState[post.post_id] = post;
            });
        }
        return newState;
    }
    return state;
}

export default entities;
