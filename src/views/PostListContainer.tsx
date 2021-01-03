import React from 'react';
import { connect } from 'react-redux';

import { PostListSortType } from '../enums/PostListSortType';
import { IPost } from '../interfaces/IPost';
import { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { fetchMorePosts, selectPost, showAddPost, updatePosts } from '../redux/actions';
import { IJodelAppStore } from '../redux/reducers';
import { isLocationKnownSelector } from '../redux/selectors/app';
import { selectedSectionLastUpdatedSelector, selectedSectionSortPostsSelector } from '../redux/selectors/posts';
import { selectedSectionSelector, selectedSortTypeSelector } from '../redux/selectors/view';
import AddButton from './AddButton';
import PostList from './PostList';
import { SortTypeLink } from './SortTypeLink';
import { StickyList } from './StickyList';

export interface IPostListContainerProps {
}

export interface IPostListContainerComponentProps extends IPostListContainerProps {
    section: string;
    sortType: PostListSortType;
    lastUpdated?: number;
    posts: IPost[];
    locationKnown: boolean;
    onPostClick: (post: IPost) => void;
    onLoadMore?: () => void;
    onAddClick: (e: React.MouseEvent<HTMLElement>) => void;
    onRefresh: () => void; // TODO implement
}

class PostListContainerComponent extends React.PureComponent<IPostListContainerComponentProps> {
    private static lastScrollPosition: number = 0;
    private static lastScrollSection: string | undefined;

    private scrollable: HTMLElement | undefined;

    public constructor(props: IPostListContainerComponentProps) {
        super(props);
    }

    public componentWillUnmount(): void {
        if (this.scrollable) {
            PostListContainerComponent.lastScrollPosition = this.scrollable.scrollTop;
            PostListContainerComponent.lastScrollSection = this.props.section + this.props.sortType;
        }
    }

    public render(): React.ReactElement | null {
        const { posts, section, sortType, lastUpdated, locationKnown, onPostClick, onAddClick, onLoadMore } = this.props;
        return (
            <div className="postListContainer">
                {section !== 'location' ? null : <StickyList />}
                <PostList section={section} sortType={sortType} lastUpdated={lastUpdated} posts={posts}
                    onPostClick={onPostClick} onLoadMore={onLoadMore}
                    connectScrollTarget={this.connectScrollTarget}
                />
                {locationKnown ? <AddButton onClick={onAddClick} /> : ''}
                <div className="sortTypes">
                    <SortTypeLink sortType={PostListSortType.RECENT} />
                    <SortTypeLink sortType={PostListSortType.DISCUSSED} />
                    <SortTypeLink sortType={PostListSortType.POPULAR} />
                </div>
            </div>
        );
    }

    private connectScrollTarget = (target: HTMLElement) => {
        this.scrollable = target;
        if (!target) {
            return;
        }
        if (PostListContainerComponent.lastScrollSection === this.props.section + this.props.sortType) {
            target.scrollTop = PostListContainerComponent.lastScrollPosition;
        } else {
            PostListContainerComponent.lastScrollPosition = 0;
        }
    };
}

const mapStateToProps = (state: IJodelAppStore, ownProps: IPostListContainerProps) => {
    return {
        lastUpdated: selectedSectionLastUpdatedSelector(state) || undefined,
        locationKnown: isLocationKnownSelector(state),
        posts: selectedSectionSortPostsSelector(state),
        section: selectedSectionSelector(state),
        sortType: selectedSortTypeSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch,
    ownProps: IPostListContainerProps) => {
    return {
        onAddClick(): void {
            dispatch(showAddPost(true));
        },
        onLoadMore(): void {
            dispatch(fetchMorePosts());
        },
        onPostClick(post: IPost): void {
            dispatch(selectPost(post != null ? post.post_id : null));
        },
        onRefresh(): void {
            dispatch(updatePosts());
        },
    };
};

export const PostListContainer = connect(mapStateToProps, mapDispatchToProps)(PostListContainerComponent);
