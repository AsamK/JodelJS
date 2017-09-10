import {Action} from 'redux';

import {PostListSortType} from '../enums/PostListSortType';
import {Section} from '../enums/Section';
import {VoteType} from '../enums/VoteType';
import {IViewStateStore} from '../redux/reducers/viewState';
import {IApiConfig} from './IApiConfig';
import {IApiPostDetailsPost, IApiPostReplyPost} from './IApiPostDetailsPost';
import {IApiPostListPost} from './IApiPostListPost';
import {IChannel} from './IChannel';
import {ILocation} from './ILocation';
import {INotification} from './INotification';
import {IToast} from './IToast';
import {IToken} from './IToken';

export interface IPayload {
    entities?: Array<IApiPostListPost | IApiPostReplyPost>;
    post?: IApiPostDetailsPost;
    entitiesChannels?: IChannel[];
    section?: Section;
    append?: boolean;
    postId?: string | null;
    pinned?: boolean;
    pinCount?: number;
    voted?: VoteType;
    voteCount?: number;
    karma?: number;
    deviceUid?: string;
    token?: IToken;
    config?: IApiConfig;
    permissionDenied?: boolean;
    channelNames?: string[];
    location?: ILocation;
    useBrowserLocation?: boolean;
    useHomeLocation?: boolean;
    isFetching?: boolean;
    key?: string | null;
    imageUrl?: string | null;
    imageWidth?: number | null;
    sortType?: PostListSortType;
    visible?: boolean;
    newViewState?: IViewStateStore;
    postsBySortType?: Array<{ sortType: PostListSortType, posts: string[] }>;
    notifications?: INotification[];
    suggestedHashtags?: string[];
    toast?: IToast;
    toastId?: number;
    nextReply?: string | null;
    shareable?: boolean;
}

export interface IJodelAction extends Action {
    // FIXME: Disabled because of incomplete redux typings, will be fixed with redux 4.0
    payload?: IPayload;
    receivedAt?: number;
}
