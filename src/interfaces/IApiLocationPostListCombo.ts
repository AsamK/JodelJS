import {IApiPostListCombo} from './IApiPostListCombo';
import {IApiSticky} from './IApiSticky';

export interface IApiLocationPostListCombo extends IApiPostListCombo {
    stickies: IApiSticky[];
}
