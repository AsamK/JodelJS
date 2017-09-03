import * as React from 'react';
import {Component} from 'react';

import {IPost} from '../interfaces/IPost';
import {Post} from './Post';

export interface PostListProps {
    posts: IPost[];
    sortType?: string;
    section?: string;
    lastUpdated?: number;
    parentPost?: IPost;
    onPostClick: (post: IPost) => void;
    onLoadMore?: () => void;
}

export default class PostList extends Component<PostListProps> {
    private _scrollAtBottom: boolean;

    private _scrollable: HTMLElement | null;

    constructor(props: PostListProps) {
        super(props);
        this._onPostClick = this._onPostClick.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    public _onPostClick(post: IPost) {
        this.props.onPostClick(post);
    }

    public componentDidMount() {
        if (this._scrollable) {
            this._scrollable.addEventListener('scroll', this._onScroll);
        }
        this._scrollAtBottom = false;
    }

    public componentDidUpdate(prevProps: PostListProps) {
        if (prevProps.sortType != this.props.sortType || prevProps.section != this.props.section || prevProps.lastUpdated != this.props.lastUpdated) {
            if (this._scrollable) {
                this._scrollable.scrollTop = 0;
            }
        }
    }

    public componentWillUnmount() {
        if (this._scrollable) {
            this._scrollable.removeEventListener('scroll', this._onScroll);
        }
    }

    public _onScroll() {
        if (!this._scrollable || !this.props.onLoadMore) {
            return;
        }
        const newFlag = this._scrollable.scrollTop > 0 && (this._scrollable.scrollTop + this._scrollable.clientHeight) >= (this._scrollable.scrollHeight - 500);
        if (this._scrollAtBottom != newFlag && newFlag) {
            this._scrollAtBottom = newFlag;
            this.props.onLoadMore();
        } else {
            this._scrollAtBottom = newFlag;
        }
    }

    public render() {
        const {posts, parentPost, onPostClick} = this.props;
        const postNodes = posts.map(post => {
                let author, parentPostId;
                if (parentPost) {
                    parentPostId = parentPost.post_id;
                    if (post.user_handle === 'oj') {
                        author = 'OJ';
                    } else if (post.replier) {
                        author = 'C' + post.replier;
                    }
                }
                return <Post key={post.post_id} post={post} parentPostId={parentPostId}
                             onPostClick={() => onPostClick(post)} author={author}/>;
            },
        );
        return (
            <div className="postList" ref={c => this._scrollable = c}>
                {postNodes}
            </div>
        );
    }
}
