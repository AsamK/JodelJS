'use strict';

import React, {Component} from "react";
import Post from "./Post";

export default class PostList extends Component {
    constructor(props) {
        super(props);
        this._onPostClick = this._onPostClick.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    static propTypes = {
        posts: React.PropTypes.array.isRequired,
        parentPost: React.PropTypes.any,
        onPostClick: React.PropTypes.func.isRequired
    };

    _onPostClick(post) {
        this.props.onPostClick(post);
    }

    componentDidMount() {
        this._scrollable.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
        this._scrollable.removeEventListener('scroll', this._onScroll);
    }

    _onScroll(event) {
        if (!this._scrollable) {
            return;
        }
        console.log(this._scrollable.scrollTop);
    }

    render() {
        const {posts, parentPost, ...forwardProps} = this.props;
        let authorList = [];
        const postNodes = posts.map((post) => {
            let author, parentPostId;
            if (parentPost != null) {
                parentPostId = parentPost.post_id;
                if (post.hasOwnProperty('parent_creator') && post.parent_creator == 1) {
                    author = "OJ";
                } else {
                    let index = authorList.indexOf(post.user_handle);
                    if (index == -1) {
                        index = authorList.push(post.user_handle) - 1;
                    }
                    author = "C" + (index + 1);
                }
            }
            return <Post key={post.post_id} post={post} parentPostId={parentPostId} onPostClick={this._onPostClick.bind(this, post)} author={author}/>
            }
        );
        return (
            <div className="postList" onScroll={this._onScroll()} ref={(c) => this._scrollable = c}>
                {postNodes}
            </div>
        );
    }
};