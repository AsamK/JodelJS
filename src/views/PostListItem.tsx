import React from 'react';

import { UserHandle } from '../enums/UserHandle';
import type { IPost } from '../interfaces/IPost';

import { Post } from './Post';

export class PostListItem
    extends React.PureComponent<{ post: IPost; parentPostId?: string; onPostClick: (post: IPost) => void }> {

    public render(): React.ReactElement | null {
        const { post, parentPostId } = this.props;

        const author = parentPostId == null
            ? post.badge
            : post.user_handle === UserHandle.OJ
                ? 'OJ'
                : post.replier ?
                    `C${post.replier}` :
                    undefined;

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
