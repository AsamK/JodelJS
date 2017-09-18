import {createSelector} from 'reselect';

import {IPost} from '../../interfaces/IPost';
import {IJodelAppStore} from '../reducers';
import {getSelectedSection, getSelectedSortType} from './view';

/* Begin Helpers **/

function getPost(posts: { [key: string]: IPost }, postId: string): IPost | null {
    return posts[postId] || null;
}

/* End Helpers */

export const getSelectedPostId = (state: IJodelAppStore) => state.viewState.selectedPostId;
const getSelectedPicturePostId = (state: IJodelAppStore) => state.viewState.selectedPicturePostId;

export const getStickies = (state: IJodelAppStore) => state.entities.stickies;

const getPosts = (state: IJodelAppStore) => state.entities.posts;

export const getSelectedPost = createSelector(
    getSelectedPostId, getPosts,
    (selectedPostId, posts): IPost | null => !selectedPostId ?
        null :
        getPost(posts, selectedPostId));

export const getSelectedPostChildren = createSelector(
    getSelectedPost, getPosts,
    (selectedPost, posts): IPost[] | null => !selectedPost ?
        null :
        !selectedPost.children ? [] :
            selectedPost.children.map(childId => getPost(posts, childId))
                .filter((child): child is IPost => !!child),
);

export const getSelectedPicturePost = createSelector(
    getSelectedPicturePostId, getPosts,
    (selectedPicturePostId, posts): IPost | null => !selectedPicturePostId ?
        null :
        getPost(posts, selectedPicturePostId));

const getPostsBySection = (state: IJodelAppStore) => state.postsBySection;

const getSelectedSectionPosts = createSelector(
    getSelectedSection, getPostsBySection,
    (selectedSection, postsBySection) => postsBySection[selectedSection],
);

export const getSelectedSectionLastUpdated = createSelector(
    getSelectedSectionPosts,
    selectedSectionPosts => !selectedSectionPosts ?
        undefined :
        selectedSectionPosts.lastUpdated,
);

export const getIsSelectedSectionFetching = createSelector(
    getSelectedSectionPosts,
    selectedSectionPosts => !selectedSectionPosts ?
        false :
        selectedSectionPosts.isFetching,
);

const getSelectedSectionSortPostIds = createSelector(
    getSelectedSectionPosts, getSelectedSortType,
    (selectedSectionPosts, selectedSortType) => !selectedSectionPosts ?
        [] :
        selectedSectionPosts.postsBySortType[selectedSortType] || [],
);

export const getSelectedSectionSortPosts = createSelector(
    getSelectedSectionSortPostIds, getPosts,
    (selectedSectionSortPostIds, posts): IPost[] =>
        selectedSectionSortPostIds.map(postId => getPost(posts, postId))
            .filter((post): post is IPost => !!post),
);
