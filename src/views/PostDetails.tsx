import * as React from 'react';
import {Component, MouseEvent} from 'react';

import {IPost} from '../interfaces/IPost';
import AddButton from './AddButton';
import {Post} from './Post';
import PostList from './PostList';

export interface PostDetailsProps {
    post: IPost
    postChildren: IPost[]
    locationKnown: boolean
    onAddClick: (e: MouseEvent<HTMLElement>) => void
    onPostClick: () => void
    onLoadMore: () => void
}

export default class PostDetails extends Component<PostDetailsProps> {
    private _scrollAtBottom: boolean;

    private _scrollable: HTMLElement;

    constructor(props: PostDetailsProps) {
        super(props);
        this._onScroll = this._onScroll.bind(this);
    }

    componentDidUpdate(prevProps: PostDetailsProps) {
        if (this.props.post === null) {
            return;
        } else if (prevProps.post !== null && prevProps.post.post_id === this.props.post.post_id) {
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

    _onScroll() {
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
        const {post, postChildren, locationKnown, onPostClick, onAddClick} = this.props;
        const childPosts = postChildren ? postChildren : [];

        return (
            <div className="postDetails" ref={(c) => this._scrollable = c}>
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ''}
            </div>
        );
    }
};