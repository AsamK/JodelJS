import {Action} from 'redux';

import {IViewStateStore} from '../redux/reducers/viewState';
import {IChannel} from './IChannel';
import {IConfig} from './IConfig';
import {ILocation} from './ILocation';
import {IApiPost, IPost} from './IPost';
import {IToken} from './IToken';
import {PostListSortType} from './PostListSortType';
import {Section} from './Section';

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
    postsBySortType?: Array<{sortType: PostListSortType, posts: string[]}>;
}
export interface IJodelAction extends Action {
    // FIXME: Disabled because of incomplete redux typings, will be fixed with redux 4.0
    payload?: IPayload;
    receivedAt?: number;
}
