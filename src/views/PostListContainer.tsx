import * as React from 'react';
import {Component, MouseEvent} from 'react';
import {connect} from 'react-redux';
import {PostListSortType} from '../interfaces/PostListSortType';

import {IJodelAppStore, isLocationKnown} from '../redux/reducers';
import {getPost} from '../redux/reducers/entities';
import AddButton from './AddButton';
import PostList from './PostList';
import SortTypeLink from './SortTypeLink';
import {IPost} from '../interfaces/IPost';

export interface PostListContainerProps {
    section: string
    sortType: string
    lastUpdated: Date
    posts: IPost[]
    locationKnown: boolean
    onPostClick: (post: IPost) => void
    onLoadMore?: () => void
    onAddClick: (e: MouseEvent<HTMLElement>) => void
}

class PostListContainer extends Component<PostListContainerProps> {
    constructor(props) {
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

const mapStateToProps = (state: IJodelAppStore, ownProps) => {
    const section = state.viewState.postSection;
    const sortType = state.viewState.postListSortType;
    const postsSection = state.postsBySection[section];
    const posts = postsSection !== undefined && postsSection.postsBySortType[sortType] ? postsSection.postsBySortType[sortType] : [];
    return {
        lastUpdated: postsSection ? postsSection.lastUpdated : undefined,
        posts: posts.map(post_id => getPost(state, post_id)),
        locationKnown: isLocationKnown(state),
    };
};

export default connect(mapStateToProps)(PostListContainer);
