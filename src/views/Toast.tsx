import classnames from 'classnames';
import React from 'react';

import { ToastType } from '../enums/ToastType';
import { IToast } from '../interfaces/IToast';
import './Toast.scss';

export interface IToastProps {
    toast: IToast;
    onClick: (toastId: number) => void;
}

export const Toast = ({ toast, onClick }: IToastProps) => {
    return (
        <div
            className={classnames('toast', {
                'toast-error': toast.type === ToastType.ERROR,
                'toast-info': toast.type === ToastType.INFO,
                'toast-warning': toast.type === ToastType.WARNING,
            })}
            onClick={() => onClick(toast.id)}
        >
            <div className="toast-message">
                {toast.message}
            </div>
        </div>
    );
};
