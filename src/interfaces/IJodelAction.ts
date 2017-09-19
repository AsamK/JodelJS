import {PostListSortType} from '../enums/PostListSortType';
import {Section} from '../enums/Section';
import {VoteType} from '../enums/VoteType';
import {
    CLOSE_STICKY,
    HIDE_TOAST,
    INVALIDATE_POSTS,
    PINNED_POST,
    RECEIVE_NOTIFICATIONS,
    RECEIVE_POST,
    RECEIVE_POSTS,
    REPLACE_VIEW_STATE,
    SELECT_PICTURE,
    SELECT_POST,
    SET_CHANNELS_META,
    SET_CONFIG,
    SET_COUNTRY_CHANNELS,
    SET_DEVICE_UID,
    SET_IMAGE_CAPTCHA,
    SET_IS_FETCHING,
    SET_KARMA,
    SET_LOCAL_CHANNELS,
    SET_LOCATION,
    SET_NOTIFICATION_POST_READ,
    SET_PERMISSION_DENIED,
    SET_RECOMMENDED_CHANNELS,
    SET_SUGGESTED_HASHTAGS,
    SET_TOKEN,
    SET_USE_BROWSER_LOCATION,
    SET_USE_HOME_LOCATION,
    SHOW_ADD_POST,
    SHOW_CHANNEL_LIST,
    SHOW_NOTIFICATIONS,
    SHOW_SEARCH,
    SHOW_SETTINGS,
    SHOW_TOAST,
    SWITCH_POST_LIST_SORT_TYPE,
    SWITCH_POST_SECTION,
    VOTED_POST,
} from '../redux/actions/action.consts';
import {IViewStateStore} from '../redux/reducers/viewState';
import {IApiConfig} from './IApiConfig';
import {IApiPostDetailsPost, IApiPostReplyPost} from './IApiPostDetailsPost';
import {IApiPostListPost} from './IApiPostListPost';
import {IApiSticky} from './IApiSticky';
import {IChannel} from './IChannel';
import {ILocation} from './ILocation';
import {INotification} from './INotification';
import {IToast} from './IToast';
import {IToken} from './IToken';

export interface IPayloadListSort {
    sortType: PostListSortType;
}

export interface IPayloadSection {
    section: Section;
}

export interface IPayloadSectionIsFetching {
    section: Section;
    isFetching: boolean;
}

export interface IPayloadVisible {
    visible: boolean;
}

export interface IPayloadReplaceView {
    newViewState: IViewStateStore;
}

export interface IPayloadPosts {
    entities: Array<IApiPostListPost | IApiPostReplyPost>;
    postsBySortType: Array<{ sortType: PostListSortType, posts: string[] }>;
    stickies?: IApiSticky[];
    append: boolean;
    section: Section;
}

export interface IPayloadPost {
    append: boolean;
    nextReply: string | null;
    post: IApiPostDetailsPost;
    shareable: boolean;
}

export interface IPayloadNotifications {
    notifications: INotification[];
}

export interface IPayloadPostId {
    postId: string;
}

export interface IPayloadSelectPost {
    postId: string | null;
}

export interface IPayloadPinned {
    postId: string;
    pinned: boolean;
    pinCount: number;
}

export interface IPayloadVoted {
    postId: string;
    voted: VoteType;
    voteCount: number;
}

export interface IPayloadKarma {
    karma: number;
}

export interface IPayloadConfig {
    config: IApiConfig;
}

export interface IPayloadChannels {
    entitiesChannels: IChannel[];
}

export interface IPayloadHashtags {
    suggestedHashtags: string[];
}

export interface IPayloadDeviceUid {
    deviceUid: string;
}

export interface IPayloadPermissionDenied {
    permissionDenied: boolean;
}

export interface IPayloadToken {
    token: IToken;
}

export interface IPayloadLocation {
    location: ILocation;
}

export interface IPayloadBrowserLocation {
    useBrowserLocation: boolean;
}

export interface IPayloadHomeLocation {
    useHomeLocation: boolean;
}

export interface IPayloadStickyId {
    stickyId: string;
}

export interface IPayloadImageCaptcha {
    key: string | null;
    imageUrl: string | null;
    imageWidth: number | null;
}

export interface IPayloadShowToast {
    toast: IToast;
}

export interface IPayloadHideToast {
    toastId: number;
}

export type IJodelAction =
    { type: typeof CLOSE_STICKY; payload: IPayloadStickyId; } |
    { type: typeof HIDE_TOAST; payload: IPayloadHideToast; } |
    { type: typeof INVALIDATE_POSTS; payload: IPayloadSection; } |
    { type: typeof PINNED_POST; payload: IPayloadPinned; } |
    { type: typeof RECEIVE_NOTIFICATIONS; payload: IPayloadNotifications; receivedAt: number } |
    { type: typeof RECEIVE_POST; payload: IPayloadPost; receivedAt: number } |
    { type: typeof RECEIVE_POSTS; payload: IPayloadPosts; receivedAt: number } |
    { type: typeof REPLACE_VIEW_STATE; payload: IPayloadReplaceView; } |
    { type: typeof SELECT_PICTURE; payload: IPayloadPostId; } |
    { type: typeof SELECT_POST; payload: IPayloadSelectPost; } |
    { type: typeof SET_CHANNELS_META; payload: IPayloadChannels; } |
    { type: typeof SET_CONFIG; payload: IPayloadConfig; } |
    { type: typeof SET_COUNTRY_CHANNELS; payload: IPayloadChannels; } |
    { type: typeof SET_DEVICE_UID; payload: IPayloadDeviceUid; } |
    { type: typeof SET_IMAGE_CAPTCHA; payload: IPayloadImageCaptcha; } |
    { type: typeof SET_IS_FETCHING; payload: IPayloadSectionIsFetching; } |
    { type: typeof SET_KARMA; payload: IPayloadKarma; } |
    { type: typeof SET_LOCAL_CHANNELS; payload: IPayloadChannels; } |
    { type: typeof SET_LOCATION; payload: IPayloadLocation; } |
    { type: typeof SET_NOTIFICATION_POST_READ; payload: IPayloadPostId; } |
    { type: typeof SET_PERMISSION_DENIED; payload: IPayloadPermissionDenied; } |
    { type: typeof SET_RECOMMENDED_CHANNELS; payload: IPayloadChannels; } |
    { type: typeof SET_SUGGESTED_HASHTAGS; payload: IPayloadHashtags; } |
    { type: typeof SET_TOKEN; payload: IPayloadToken; } |
    { type: typeof SET_USE_BROWSER_LOCATION; payload: IPayloadBrowserLocation; } |
    { type: typeof SET_USE_HOME_LOCATION; payload: IPayloadHomeLocation; } |
    { type: typeof SHOW_ADD_POST; payload: IPayloadVisible; } |
    { type: typeof SHOW_CHANNEL_LIST; payload: IPayloadVisible; } |
    { type: typeof SHOW_NOTIFICATIONS; payload: IPayloadVisible; } |
    { type: typeof SHOW_SEARCH; payload: IPayloadVisible; } |
    { type: typeof SHOW_SETTINGS; payload: IPayloadVisible; } |
    { type: typeof SHOW_TOAST; payload: IPayloadShowToast; } |
    { type: typeof SWITCH_POST_LIST_SORT_TYPE | 'bar'; payload: IPayloadListSort; } |
    { type: typeof SWITCH_POST_SECTION; payload: IPayloadSection; } |
    { type: typeof VOTED_POST; payload: IPayloadVoted; }
    ;
