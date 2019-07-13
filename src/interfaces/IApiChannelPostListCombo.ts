import { IApiPostListCombo } from './IApiPostListCombo';

export interface IApiChannelPostListCombo extends IApiPostListCombo {
    followers_count: number;
    country_followers_count: number;
    sponsored: boolean;
}
