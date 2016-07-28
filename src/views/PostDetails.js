'use strict';

import React, {Component} from "react";
import Post from "./Post";
import PostList from "./PostList";
import AddButton from "./AddButton";

export default class PostDetails extends Component {
    static propTypes = {
        post: React.PropTypes.any.isRequired,
        onAddClick: React.PropTypes.func.isRequired,
    };

    render() {
        const {post, onPostClick, onAddClick, ...forwardProps} = this.props;
        const childPosts = post.hasOwnProperty("children") ? post.children : [];

        return (
            <div className="postDetails">
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
                <AddButton onClick={onAddClick}/>
            </div>
        );
    }
};