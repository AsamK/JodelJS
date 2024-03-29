import type { Color } from '../enums/Color';
import type { PostOwn } from '../enums/PostOwn';
import type { UserHandle } from '../enums/UserHandle';
import type { VoteType } from '../enums/VoteType';

export interface IApiLocation {
    name: string;
}

export interface IPost {
    badge?: string;
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
    news_url?: string;
    news_cta?: string;
    share_count?: number;
    shareable?: boolean;
    thumbnail_url?: string;
    updated_at: string;
    user_handle: UserHandle;
    video_url?: string;
    view_count?: number;
    vote_count: number;
    voted?: VoteType;
    votable?: boolean;
    poll_id?: string;
    poll_options?: [string];
    poll_votes?: [number];
    poll_vote?: number;
}
