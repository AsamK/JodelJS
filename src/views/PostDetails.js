'use strict';

import React, {Component} from "react";
import Post from "./Post";
import PostList from "./PostList";
import AddButton from "./AddButton";

export default class PostDetails extends Component {
    static propTypes = {
        post: React.PropTypes.any.isRequired,
        locationKnown: React.PropTypes.bool.isRequired,
        onAddClick: React.PropTypes.func.isRequired,
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.post === null || (prevProps.post !== null && prevProps.post.get("post_id") === this.props.post.get("post_id"))) {
            return;
        }
        this._scrollable.scrollTop = 0;
    }

    render() {
        const {post, locationKnown, onPostClick, onAddClick, ...forwardProps} = this.props;
        const childPosts = post.has("children") ? post.get("children") : [];

        return (
            <div className="postDetails" ref={(c) => this._scrollable = c}>
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ""}
            </div>
        );
    }
};