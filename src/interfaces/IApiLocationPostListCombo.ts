import type { IApiPostListCombo } from './IApiPostListCombo';
import type { IApiSticky } from './IApiSticky';

export interface IApiLocationPostListCombo extends IApiPostListCombo {
    stickies: IApiSticky[];
}
