import {IJodelAction} from '../../interfaces/IJodelAction';
import {IToast} from '../../interfaces/IToast';
import {HIDE_TOAST, SHOW_TOAST} from '../actions/toasts.actions';

export function toasts(state: IToast[] = [], action: IJodelAction): typeof state {
    switch (action.type) {
        case SHOW_TOAST:
            if (!action.payload || !action.payload.toast) {
                return state;
            }
            return [
                ...state,
                action.payload.toast,
            ];
        case HIDE_TOAST:
            if (!action.payload) {
                return state;
            }
            const toastId = action.payload.toastId;
            return state.filter(toast => toast.id !== toastId);
        default:
            return state;
    }
}
