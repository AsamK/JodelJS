import * as React from 'react';
import {Component, MouseEvent} from 'react';

import {IPost} from '../interfaces/IPost';
import AddButton from './AddButton';
import {Post} from './Post';
import PostList from './PostList';

export interface IPostDetailsProps {
    post: IPost;
    postChildren: IPost[] | null;
    locationKnown: boolean;
    onAddClick: (e: MouseEvent<HTMLElement>) => void;
    onPostClick: () => void;
    onLoadMore: () => void;
}

export default class PostDetails extends Component<IPostDetailsProps> {
    private scrollAtBottom = false;

    private scrollable: HTMLDivElement | null = null;

    constructor(props: IPostDetailsProps) {
        super(props);
        this._onScroll = this._onScroll.bind(this);
    }

    public componentDidUpdate(prevProps: IPostDetailsProps) {
        if (this.props.post === null) {
            return;
        } else if (prevProps.post !== null && prevProps.post.post_id === this.props.post.post_id) {
            this.scrollAtBottom = false;
            return;
        }
        if (this.scrollable) {
            this.scrollable.scrollTop = 0;
        }
    }

    public componentDidMount() {
        if (this.scrollable) {
            this.scrollable.addEventListener('scroll', this._onScroll);
        }
        this.scrollAtBottom = false;
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
        const isNearBottom = this.scrollable.scrollTop > 0 &&
            (this.scrollable.scrollTop + this.scrollable.clientHeight) >= (this.scrollable.scrollHeight - 500);
        if (isNearBottom && this.scrollAtBottom !== isNearBottom) {
            this.scrollAtBottom = isNearBottom;
            this.props.onLoadMore();
        } else {
            this.scrollAtBottom = isNearBottom;
        }
    }

    public render() {
        const {post, postChildren, locationKnown, onPostClick, onAddClick} = this.props;
        const childPosts = postChildren ? postChildren : [];

        return (
            <div className="postDetails" ref={c => this.scrollable = c}>
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ''}
            </div>
        );
    }
}
