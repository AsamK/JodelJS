import { Color } from '../enums/Color';
import { PostOwn } from '../enums/PostOwn';
import { UserHandle } from '../enums/UserHandle';
import { VoteType } from '../enums/VoteType';
import { IApiPostReplyPost } from './IApiPostDetailsPost';
import { IApiLocation } from './IPost';

export interface IApiPostListPost {
    badge?: string;
    channel?: string;
    child_count: number;
    children: IApiPostReplyPost[];
    color: Color;
    created_at: string;
    discovered_by: number;
    distance: number;
    from_home?: boolean;
    got_thanks: boolean;
    image_approved: string;
    image_url?: string;
    location: IApiLocation;
    message: string;
    oj_replied: boolean;
    pin_count: number;
    pinned?: boolean;
    post_id: string;
    post_own: PostOwn;
    replier: number;
    news_url?: string;
    news_cta?: string;
    share_count: number;
    thumbnail_url?: string;
    updated_at: string;
    user_handle: UserHandle;
    view_count: number;
    vote_count: number;
    voted?: VoteType;
    image_headers: {
        Host: string;
        'X-Amz-Date': string;
        'x-amz-content-sha256': string;
        Authorization: string;
    };
}
