import type { IApiPostReplyPost } from './IApiPostDetailsPost';
import type { IApiPostListPost } from './IApiPostListPost';

export interface IApiVote {
    post: IApiPostListPost | IApiPostReplyPost;
    vote_count: number;
}
