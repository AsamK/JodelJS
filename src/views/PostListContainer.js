'use strict';

import React, {Component} from "react";
import Post from "./Post";

export default class PostList extends Component {
    constructor(props) {
        super(props);
        this._onPostClick = this._onPostClick.bind(this);
    }

    static propTypes = {
        posts: React.PropTypes.array.isRequired,
        parentPost: React.PropTypes.any,
        onPostClick: React.PropTypes.func.isRequired
    };

    _onPostClick(post) {
        this.props.onPostClick(post);
    }

    render() {
        const {posts, parentPost, ...forwardProps} = this.props;
        let authorList = [];
        const postNodes = posts.map((post) => {
            let author;
            if (parentPost != null) {
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
            return <Post key={post.post_id} post={post} onPostClick={this._onPostClick.bind(this, post)} author={author}/>
            }
        );
        return (
            <div className="postList">
                {postNodes}
            </div>
        );
    }
};