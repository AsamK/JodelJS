'use strict';

import React, {Component} from "react";
import Post from "./Post";
import PropTypes from 'prop-types';

export default class PostList extends Component {
    constructor(props) {
        super(props);
        this._onPostClick = this._onPostClick.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    static propTypes = {
        posts: PropTypes.array.isRequired,
        sortType: PropTypes.string,
        section: PropTypes.string,
        lastUpdated: PropTypes.number,
        parentPost: PropTypes.any,
        onPostClick: PropTypes.func.isRequired,
        onLoadMore: PropTypes.func
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
                if (parentPost !== null) {
                    if (post.get("user_handle") === 'oj') {
                        author = "OJ";
                    } else if (post.has('replier')) {
                        author = "C" + post.get("replier");
                    }
                }
                return <Post key={post.get("post_id")} post={post} parentPostId={parentPostId}
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
