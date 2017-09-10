import {ToastType} from '../../enums/ToastType';
import {IJodelAction} from '../../interfaces/IJodelAction';

export const SHOW_TOAST = 'SHOW_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';

let nextToastId = 0;

export function showToast(message: string, type: ToastType): IJodelAction {
    return {
        payload: {
            toast: {
                id: nextToastId++,
                message,
                type,
            },
        },
        type: SHOW_TOAST,
    };
}

export function hideToast(toastId: number): IJodelAction {
    return {
        payload: {toastId},
        type: HIDE_TOAST,
    };
}
