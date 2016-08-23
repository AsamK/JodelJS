import {
    SELECT_POST,
    SET_LOCATION,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
    PostListSortTypes,
    SHOW_ADD_POST,
    SELECT_PICTURE
} from "../actions";
import {SET_USE_BROWSER_LOCATION, SHOW_SETTINGS} from "../actions/state";
import Immutable from "immutable";

export const VIEW_STATE_VERSION = 6;
export function migrateViewState(storedState, oldVersion) {
    if (oldVersion < 2) {
        storedState.location.country = "DE";
    }
    if (oldVersion < 3) {
        storedState.useBrowserLocation = true;
    }
    if (oldVersion < 5) {
        storedState.settings = {visible: false};
    }
    if (oldVersion < 6) {
        storedState.selectedPicturePostId = null;
    }
    return storedState;
}

function viewState(state = Immutable.Map({
    selectedPostId: null,
    selectedPicturePostId: null,
    location: Immutable.Map({latitude: undefined, longitude: undefined, city: undefined, country: "DE"}),
    useBrowserLocation: true,
    postSection: undefined,
    postListSortType: PostListSortTypes.RECENT,
    addPost: Immutable.Map({visible: false, ancestor: undefined}),
    settings: Immutable.Map({visible: false}),
}), action) {
    switch (action.type) {
        case SELECT_POST:
            return state.set("selectedPostId", action.postId);
        case SELECT_PICTURE:
            return state.set("selectedPicturePostId", action.postId);
        case SET_LOCATION:
            return state.update("location", location => location.merge(action.location));
        case SWITCH_POST_LIST_SORT_TYPE:
            return state.set("postListSortType", action.sortType);
        case SWITCH_POST_SECTION:
            return state.set("postSection", action.section);
        case SHOW_ADD_POST:
            return state.update("addPost", addPost => addPost.merge({
                visible: action.visible,
                ancestor: action.ancestor
            }));
        case SHOW_SETTINGS:
            return state.update("settings", settings => settings.set("visible", action.visible));
        case SET_USE_BROWSER_LOCATION:
            return state.set("useBrowserLocation", action.useBrowserLocation);
        default:
            return state
    }
}

export default viewState;
