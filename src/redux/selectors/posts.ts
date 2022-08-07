import { createSelector } from 'reselect';

import type { IPost } from '../../interfaces/IPost';
import type { IJodelAppStore } from '../reducers';

import { selectedSectionSelector, selectedSortTypeSelector } from './view';

/* Begin Helpers **/

function getPost(posts: { [key: string]: IPost }, postId: string): IPost | null {
    return posts[postId] || null;
}

/* End Helpers */

export const selectedPostIdSelector = (state: IJodelAppStore) => state.viewState.selectedPostId;
const selectedPicturePostIdSelector = (state: IJodelAppStore) =>
    state.viewState.selectedPicturePostId;

export const stickiesSelector = (state: IJodelAppStore) => state.entities.stickies;

const postsSelector = (state: IJodelAppStore) => state.entities.posts;

export const selectedPostSelector = createSelector(
    selectedPostIdSelector,
    postsSelector,
    (selectedPostId, posts): IPost | null =>
        !selectedPostId ? null : getPost(posts, selectedPostId),
);

export const selectedPostChildrenSelector = createSelector(
    selectedPostSelector,
    postsSelector,
    (selectedPost, posts): IPost[] | null =>
        !selectedPost
            ? null
            : !selectedPost.children
            ? []
            : selectedPost.children
                  .map(childId => getPost(posts, childId))
                  .filter((child): child is IPost => !!child),
);

export const selectedPicturePostSelector = createSelector(
    selectedPicturePostIdSelector,
    postsSelector,
    (selectedPicturePostId, posts): IPost | null =>
        !selectedPicturePostId ? null : getPost(posts, selectedPicturePostId),
);

const postsBySectionSelector = (state: IJodelAppStore) => state.postsBySection;

const selectedSectionPostsSelector = createSelector(
    selectedSectionSelector,
    postsBySectionSelector,
    (selectedSection, postsBySection) => postsBySection[selectedSection],
);

export const selectedSectionLastUpdatedSelector = createSelector(
    selectedSectionPostsSelector,
    selectedSectionPosts => (!selectedSectionPosts ? undefined : selectedSectionPosts.lastUpdated),
);

export const isSelectedSectionFetchingSelector = createSelector(
    selectedSectionPostsSelector,
    selectedSectionPosts => (!selectedSectionPosts ? false : selectedSectionPosts.isFetching),
);

const selectedSectionSortPostIdsSelector = createSelector(
    selectedSectionPostsSelector,
    selectedSortTypeSelector,
    (selectedSectionPosts, selectedSortType) =>
        !selectedSectionPosts ? [] : selectedSectionPosts.postsBySortType[selectedSortType] || [],
);

export const selectedSectionSortPostsSelector = createSelector(
    selectedSectionSortPostIdsSelector,
    postsSelector,
    (selectedSectionSortPostIds, posts): IPost[] =>
        selectedSectionSortPostIds
            .map(postId => getPost(posts, postId))
            .filter((post): post is IPost => !!post && post.promoted === false),
);
