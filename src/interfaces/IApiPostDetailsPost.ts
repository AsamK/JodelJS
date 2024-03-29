import type { Color } from '../enums/Color';
import type { PostOwn } from '../enums/PostOwn';
import type { UserHandle } from '../enums/UserHandle';
import type { VoteType } from '../enums/VoteType';

import type { IApiPostListPost } from './IApiPostListPost';
import type { IApiLocation } from './IPost';

export interface IApiPostDetailsPost extends IApiPostListPost {
    notifications_enabled: boolean;
}

export interface IApiPostReplyPost {
    child_count: number;
    collapse: boolean;
    color: Color;
    created_at: string;
    discovered_by: number;
    distance: number;
    from_home?: boolean;
    got_thanks: boolean;
    image_approved: string;
    image_url?: string;
    image_headers: {
        Host: string;
        'X-Amz-Date': string;
        'x-amz-content-sha256': string;
        Authorization: string;
    };
    location: IApiLocation;
    message: string;
    notifications_enabled: boolean;
    oj_replied: boolean;
    parent_id: string;
    pin_count: number;
    post_id: string;
    post_own: PostOwn;
    promoted: boolean;
    replier: number;
    reply_timestamp: string;
    thumbnail_url?: string;
    updated_at: string;
    user_handle: UserHandle;
    vote_count: number;
    voted?: VoteType;
}
