'use strict';

import React, {Component} from "react";
import Post from "./Post";
import PostList from "./PostList";

export default class PostDetails extends Component {
    static propTypes = {
        post: React.PropTypes.any.isRequired,
    };

    render() {
        const {post, onPostClick, ...forwardProps} = this.props;
        const childPosts = post.hasOwnProperty("children") ? post.children : [];

        return (
            <div className="postDetails">
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
            </div>
        );
    }
};