import type { ToastType } from '../../enums/ToastType';
import type { IJodelAction } from '../../interfaces/IJodelAction';

import { HIDE_TOAST, SHOW_TOAST } from './action.consts';

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
        payload: { toastId },
        type: HIDE_TOAST,
    };
}
