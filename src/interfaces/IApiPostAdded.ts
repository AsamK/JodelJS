import { IApiPostDetailsPost } from './IApiPostDetailsPost';

export interface IApiPostAdded {
    post_id: string;
    created_at: number;
    parent: IApiPostDetailsPost | null;
}
