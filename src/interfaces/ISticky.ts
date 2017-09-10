import {Color} from '../enums/Color';
import {StickyType} from '../enums/StickyType';

export interface ISticky {
    message: string;
    type: StickyType;
    stickypost_id: string;
    color: Color;
    location_name: string;
    buttons?: void[];
    link?: string;
}
