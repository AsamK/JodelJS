import {Action} from 'redux';

import {PostListSortType} from '../enums/PostListSortType';
import {Section} from '../enums/Section';
import {IViewStateStore} from '../redux/reducers/viewState';
import {IChannel} from './IChannel';
import {IConfig} from './IConfig';
import {ILocation} from './ILocation';
import {INotification} from './INotification';
import {IApiPost} from './IPost';
import {IToast} from './IToast';
import {IToken} from './IToken';

export interface IPayload {
    entities?: IApiPost[];
    entitiesChannels?: IChannel[];
    section?: Section;
    append?: boolean;
    postId?: string | null;
    pinned?: boolean;
    pinCount?: number;
    karma?: number;
    deviceUid?: string;
    token?: IToken;
    config?: IConfig;
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
}

export interface IJodelAction extends Action {
    // FIXME: Disabled because of incomplete redux typings, will be fixed with redux 4.0
    payload?: IPayload;
    receivedAt?: number;
}
