import { ToastType } from '../enums/ToastType';

export interface IToast {
    id: number;
    message: string;
    type: ToastType;
}
