import {IApiPostListCombo} from './IApiPostListCombo';
import {ISticky} from './ISticky';

export interface IApiLocationPostListCombo extends IApiPostListCombo {
    stickies: ISticky[];
}
