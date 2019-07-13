import React from 'react';

import { UserHandle } from '../enums/UserHandle';
import { IPost } from '../interfaces/IPost';
import { Post } from './Post';

export class PostListItem
    extends React.PureComponent<{ post: IPost, parentPostId?: string, onPostClick: (post: IPost) => void }> {

    public render() {
        const { post, parentPostId } = this.props;

        const author = parentPostId == null ? undefined :
            post.user_handle === UserHandle.OJ ? 'OJ' :
                post.replier ? 'C' + post.replier : undefined;

        return <Post
            post={post}
            parentPostId={parentPostId}
            onPostClick={this.onPostClick} author={author}
        />;
    }

    private onPostClick = () => {
        this.props.onPostClick(this.props.post);
    };
}
