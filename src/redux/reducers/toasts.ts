import type { IJodelAction } from '../../interfaces/IJodelAction';
import type { IToast } from '../../interfaces/IToast';
import { HIDE_TOAST, SHOW_TOAST } from '../actions/action.consts';

export function toasts(state: readonly IToast[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SHOW_TOAST:
            return [...state, action.payload.toast];
        case HIDE_TOAST: {
            const toastId = action.payload.toastId;
            return state.filter(toast => toast.id !== toastId);
        }
        default:
            return state;
    }
}
