import * as Immutable from 'immutable';
import {
    REPLACE_VIEW_STATE,
    SELECT_PICTURE,
    SELECT_POST,
    SHOW_ADD_POST,
    SHOW_CHANNEL_LIST,
    SHOW_SETTINGS,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
} from '../actions';
import {PostListSortTypes} from '../actions/state';

function viewState(state = Immutable.Map<string, any>({
    selectedPostId: null,
    selectedPicturePostId: null,
    postSection: 'location',
    postListSortType: PostListSortTypes.RECENT,
    addPost: Immutable.Map({visible: false}),
    settings: Immutable.Map({visible: false}),
    channelList: Immutable.Map({visible: false}),
}), action) {
    switch (action.type) {
    case SELECT_POST:
        return state.set('selectedPostId', action.postId);
    case SELECT_PICTURE:
        return state.set('selectedPicturePostId', action.postId);
    case SWITCH_POST_LIST_SORT_TYPE:
        return state.set('postListSortType', action.sortType);
    case SWITCH_POST_SECTION:
        return state.set('postSection', action.section);
    case SHOW_ADD_POST:
        return state.update('addPost', addPost => addPost.merge({
            visible: action.visible,
        }));
    case SHOW_SETTINGS:
        return state.update('settings', settings => settings.set('visible', action.visible));
    case SHOW_CHANNEL_LIST:
        return state.update('channelList', channelList => channelList.set('visible', action.visible));
    case REPLACE_VIEW_STATE:
        return state.merge(action.newViewState);
    default:
        return state;
    }
}

export default viewState;
