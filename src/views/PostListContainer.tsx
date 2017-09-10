import * as React from 'react';
import {MouseEvent, PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';

import {PostListSortType} from '../enums/PostListSortType';
import {IPost} from '../interfaces/IPost';
import {IJodelAppStore, isLocationKnown} from '../redux/reducers';
import {getPost} from '../redux/reducers/entities';
import AddButton from './AddButton';
import PostList from './PostList';
import {SortTypeLink} from './SortTypeLink';

export interface IPostListContainerProps {
    onPostClick: (post: IPost) => void;
    onLoadMore?: () => void;
    onAddClick: (e: MouseEvent<HTMLElement>) => void;
    onRefresh: () => void; // TODO implement
}

export interface IPostListContainerComponentProps extends IPostListContainerProps {
    section: string;
    sortType: PostListSortType;
    lastUpdated: number;
    posts: IPost[];
    locationKnown: boolean;
}

class PostListContainerComponent extends PureComponent<IPostListContainerComponentProps> {
    public constructor(props: IPostListContainerComponentProps) {
        super(props);
    }

    public render() {
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

const mapStateToProps = (state: IJodelAppStore, ownProps: IPostListContainerProps) => {
    const section = state.viewState.postSection;
    const sortType = state.viewState.postListSortType;
    const postsSection = state.postsBySection[section];
    const posts = postsSection !== undefined && postsSection.postsBySortType[sortType] ?
        postsSection.postsBySortType[sortType] :
        [];
    return {
        lastUpdated: postsSection ? postsSection.lastUpdated : undefined,
        locationKnown: isLocationKnown(state),
        posts: posts.map(postId => getPost(state, postId)),
        section,
        sortType,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: IPostListContainerProps) => {
    return {};
};

export const PostListContainer = connect(mapStateToProps, mapDispatchToProps)(PostListContainerComponent);
