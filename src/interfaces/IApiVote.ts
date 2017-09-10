import {IApiPostReplyPost} from './IApiPostDetailsPost';
import {IApiPostListPost} from './IApiPostListPost';

export interface IApiVote {
    post: IApiPostListPost | IApiPostReplyPost;
    vote_count: number;
}
