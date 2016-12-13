'use strict';

import React, {Component} from "react";
import Post from "./Post";
import PostList from "./PostList";
import AddButton from "./AddButton";

export default class PostDetails extends Component {
    constructor(props) {
        super(props);
        this._onScroll = this._onScroll.bind(this);
    }
    static propTypes = {
        post: React.PropTypes.any.isRequired,
        locationKnown: React.PropTypes.bool.isRequired,
        onAddClick: React.PropTypes.func.isRequired,
        onPostClick: React.PropTypes.func.isRequired,
        onLoadMore: React.PropTypes.func.isRequired,
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.post === null) {
            return;
        } else if (prevProps.post !== null && prevProps.post.get("post_id") === this.props.post.get("post_id")) {
            this._scrollAtBottom = false;
            return;
        }
        this._scrollable.scrollTop = 0;
    }
    componentDidMount() {
        this._scrollable.addEventListener('scroll', this._onScroll);
        this._scrollAtBottom = false;
    }

    componentWillUnmount() {
        this._scrollable.removeEventListener('scroll', this._onScroll);
    }

    _onScroll(event) {
        if (!this._scrollable || !this.props.onLoadMore) {
            return;
        }
        let newFlag = this._scrollable.scrollTop > 0 && (this._scrollable.scrollTop + this._scrollable.clientHeight) >= (this._scrollable.scrollHeight - 500);
        if (this._scrollAtBottom != newFlag && newFlag) {
            this._scrollAtBottom = newFlag;
            this.props.onLoadMore();
        } else {
            this._scrollAtBottom = newFlag;
        }
    }

    render() {
        const {post, locationKnown, onPostClick, onAddClick, onLoadMore} = this.props;
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