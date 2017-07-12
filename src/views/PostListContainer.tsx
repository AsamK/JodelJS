import * as Immutable from 'immutable';
import * as React from 'react';
import {Component, MouseEvent} from 'react';
import {connect} from 'react-redux';
import {PostListSortTypes} from '../redux/actions';
import {IJodelAppStore, isLocationKnown} from '../redux/reducers';
import {getPost} from '../redux/reducers/entities';
import AddButton from './AddButton';
import PostList from './PostList';
import SortTypeLink from './SortTypeLink';

export interface PostListContainerProps {
    section: string
    sortType: string
    lastUpdated: Date
    posts: Immutable.List<any>
    locationKnown: boolean
    onPostClick: (post: any) => void
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
                    <SortTypeLink sortType={PostListSortTypes.RECENT}/>
                    <SortTypeLink sortType={PostListSortTypes.DISCUSSED}/>
                    <SortTypeLink sortType={PostListSortTypes.POPULAR}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    const section = state.viewState.get('postSection');
    const sortType = state.viewState.get('postListSortType');
    let posts = state.postsBySection.getIn([section, sortType]);
    if (posts === undefined) {
        posts = [];
    }
    return {
        lastUpdated: state.postsBySection.getIn([section, 'lastUpdated']),
        posts: posts.map(post_id => getPost(state, post_id)),
        locationKnown: isLocationKnown(state),
    };
};

export default connect(mapStateToProps)(PostListContainer);
