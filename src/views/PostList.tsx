import * as React from 'react';
import {Component} from 'react';

import {IPost} from '../interfaces/IPost';
import {Post} from './Post';

export interface IPostListProps {
    posts: IPost[];
    sortType?: string;
    section?: string;
    lastUpdated?: number;
    parentPost?: IPost;
    onPostClick: (post: IPost) => void;
    onLoadMore?: () => void;
}

export default class PostList extends Component<IPostListProps> {
    private scrollAtBottom: boolean;

    private scrollable: HTMLElement | null;

    constructor(props: IPostListProps) {
        super(props);
        this._onPostClick = this._onPostClick.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    public _onPostClick(post: IPost) {
        this.props.onPostClick(post);
    }

    public componentDidMount() {
        if (this.scrollable) {
            this.scrollable.addEventListener('scroll', this._onScroll);
        }
        this.scrollAtBottom = false;
    }

    public componentDidUpdate(prevProps: IPostListProps) {
        if (prevProps.sortType !== this.props.sortType || prevProps.section !== this.props.section ||
            prevProps.lastUpdated !== this.props.lastUpdated) {
            if (this.scrollable) {
                this.scrollable.scrollTop = 0;
            }
        }
    }

    public componentWillUnmount() {
        if (this.scrollable) {
            this.scrollable.removeEventListener('scroll', this._onScroll);
        }
    }

    public _onScroll() {
        if (!this.scrollable || !this.props.onLoadMore) {
            return;
        }
        const newFlag = this.scrollable.scrollTop > 0 &&
            (this.scrollable.scrollTop + this.scrollable.clientHeight) >= (this.scrollable.scrollHeight - 500);
        if (this.scrollAtBottom !== newFlag && newFlag) {
            this.scrollAtBottom = newFlag;
            this.props.onLoadMore();
        } else {
            this.scrollAtBottom = newFlag;
        }
    }

    public render() {
        const {posts, parentPost, onPostClick} = this.props;
        const postNodes = posts.map(post => {
                let author;
                let parentPostId;
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
            <div className="postList" ref={c => this.scrollable = c}>
                {postNodes}
            </div>
        );
    }
}
