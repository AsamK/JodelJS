import * as React from 'react';
import {Component, MouseEvent, PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';

import {IPost} from '../interfaces/IPost';
import {PostListSortType} from '../enums/PostListSortType';
import {IJodelAppStore, isLocationKnown} from '../redux/reducers';
import {getPost} from '../redux/reducers/entities';
import AddButton from './AddButton';
import PostList from './PostList';
import {SortTypeLink} from './SortTypeLink';

export interface PostListContainerProps {
    onPostClick: (post: IPost) => void
    onLoadMore?: () => void
    onAddClick: (e: MouseEvent<HTMLElement>) => void
    onRefresh: () => void // TODO implement
}

export interface PostListContainerComponentProps extends PostListContainerProps {
    section: string
    sortType: PostListSortType
    lastUpdated: number
    posts: IPost[]
    locationKnown: boolean
}

class PostListContainerComponent extends PureComponent<PostListContainerComponentProps> {
    public constructor(props: PostListContainerComponentProps) {
        super(props);
    }

    render() {
        const {posts, section, sortType, lastUpdated, locationKnown, onPostClick, onAddClick, onLoadMore} = this.props;
        return (
            <div className="postListContainer">
                <PostList section={section} sortType={sortType} lastUpdated={lastUpdated} posts={posts}
                          onPostClick={onPostClick} onLoadMore={onLoadMore}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ''}
                <div className="sortTypes">
                    <SortTypeLink sortType={PostListSortType.RECENT}/>
                    <SortTypeLink sortType={PostListSortType.DISCUSSED}/>
                    <SortTypeLink sortType={PostListSortType.POPULAR}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore, ownProps: PostListContainerProps) => {
    const section = state.viewState.postSection;
    const sortType = state.viewState.postListSortType;
    const postsSection = state.postsBySection[section];
    const posts = postsSection !== undefined && postsSection.postsBySortType[sortType] ? postsSection.postsBySortType[sortType] : [];
    return {
        section,
        sortType,
        lastUpdated: postsSection ? postsSection.lastUpdated : undefined,
        posts: posts.map(post_id => getPost(state, post_id)),
        locationKnown: isLocationKnown(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: PostListContainerProps) => {
    return {};
};

export const PostListContainer = connect(mapStateToProps, mapDispatchToProps)(PostListContainerComponent);
