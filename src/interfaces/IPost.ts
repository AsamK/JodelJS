import {Color} from '../enums/Color';
import {PostOwn} from '../enums/PostOwn';
import {UserHandle} from '../enums/UserHandle';
import {VoteType} from '../enums/VoteType';

export interface IApiLocation {
    name: string;
}

export interface IPost {
    channel?: string;
    child_count?: number;
    children?: string[];
    color: Color;
    collapse?: boolean;
    created_at: string;
    discovered_by: number;
    distance: number;
    from_home?: boolean;
    got_thanks?: boolean;
    image_approved?: string;
    image_headers: {
        Host: string;
        'X-Amz-Date': string;
        'x-amz-content-sha256': string;
        Authorization: string;
    };
    image_url?: string;
    location: IApiLocation;
    message: string;
    next_reply?: string | null;
    notifications_enabled?: boolean;
    oj_filtered?: boolean;
    oj_replied: boolean;
    parent_id?: string;
    pin_count?: number;
    pinned?: boolean;
    post_id: string;
    post_own: PostOwn;
    promoted: boolean;
    replier?: number;
    reply_timestamp?: string;
    share_count?: number;
    shareable?: boolean;
    thumbnail_url?: string;
    updated_at: string;
    user_handle: UserHandle;
    view_count?: number;
    vote_count: number;
    voted?: VoteType;
}
