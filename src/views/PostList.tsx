import React from 'react';

import {IPost} from '../interfaces/IPost';
import {PostListItem} from './PostListItem';

export interface IPostListProps {
    posts: IPost[];
    sortType?: string;
    section?: string;
    lastUpdated?: number;
    parentPost?: IPost;
    onPostClick: (post: IPost) => void;
    onLoadMore?: () => void;
    connectScrollTarget?: (element: HTMLElement) => void;
}

export default class PostList extends React.PureComponent<IPostListProps> {
    private scrollAtBottom = false;

    private scrollable: HTMLElement | null = null;

    constructor(props: IPostListProps) {
        super(props);
    }

    public componentDidMount() {
        if (this.scrollable) {
            this.scrollable.addEventListener('scroll', this.onScroll);
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
            this.scrollable.removeEventListener('scroll', this.onScroll);
        }
    }

    public render() {
        const {posts, parentPost, onPostClick} = this.props;
        const postNodes = posts.map(post => (
                <PostListItem
                    key={post.post_id}
                    parentPostId={parentPost ? parentPost.post_id : undefined}
                    onPostClick={onPostClick}
                    post={post}
                />
            ),
        );
        return (
            <div className="postList" ref={this.postListRef}>
                {postNodes}
            </div>
        );
    }

    private postListRef = (element: HTMLDivElement) => {
        this.scrollable = element;
        if (this.props.connectScrollTarget) {
            this.props.connectScrollTarget(element);
        }
    };

    private onScroll = () => {
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
    };
}
