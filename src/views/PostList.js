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
        sortType: React.PropTypes.string,
        section: React.PropTypes.string,
        lastUpdated: React.PropTypes.number,
        parentPost: React.PropTypes.any,
        onPostClick: React.PropTypes.func.isRequired,
        onLoadMore: React.PropTypes.func
    };

    _onPostClick(post) {
        this.props.onPostClick(post);
    }

    componentDidMount() {
        this._scrollable.addEventListener('scroll', this._onScroll);
        this._scrollAtBottom = false;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sortType != this.props.sortType || prevProps.section != this.props.section || prevProps.lastUpdated != this.props.lastUpdated) {
            this._scrollable.scrollTop = 0;
        }
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
        const {posts, parentPost, ...forwardProps} = this.props;
        let authorList = [];
        const postNodes = posts.map((post) => {
                let author, parentPostId;
                if (parentPost != null) {
                    parentPostId = parentPost.post_id;
                    let parentUserHandle = parentPost.user_handle;
                    if ((post.hasOwnProperty('parent_creator') && post.parent_creator == 1) || post.user_handle === parentUserHandle) {
                        author = "OJ";
                    } else {
                        let index = authorList.indexOf(post.user_handle);
                        if (index == -1) {
                            index = authorList.push(post.user_handle) - 1;
                        }
                        author = "C" + (index + 1);
                    }
                }
                return <Post key={post.post_id} post={post} parentPostId={parentPostId}
                             onPostClick={this._onPostClick.bind(this, post)} author={author}/>
            }
        );
        return (
            <div className="postList" ref={(c) => this._scrollable = c}>
                {postNodes}
            </div>
        );
    }
};
