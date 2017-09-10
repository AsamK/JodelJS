import {IApiPostListPost} from './IApiPostListPost';

export interface IApiPostListCombo {
    max: number;
    recent: IApiPostListPost[];
    replied: IApiPostListPost[];
    voted: IApiPostListPost[];
}
