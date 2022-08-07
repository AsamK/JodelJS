import type { Color } from '../enums/Color';
import type { StickyType } from '../enums/StickyType';

export interface IApiStickyButton {
    title: string;
}

export interface IApiSticky {
    message: string;
    type: StickyType;
    stickypost_id: string;
    color: Color;
    location_name: string;
    buttons?: IApiStickyButton[];
    link?: string;
}
