import { IApiPostDetailsPost, IApiPostReplyPost } from './IApiPostDetailsPost';

export interface IApiPostDetails {
    details: IApiPostDetailsPost;
    replies: IApiPostReplyPost[];
    next: string | null;
    hasPrev: boolean;
    remaining: number;
    shareable: boolean;
    readonly: boolean;
}
