import {IJodelAction} from '../../interfaces/IJodelAction';
import {SET_IMAGE_CAPTCHA} from '../actions/state';

export interface ICaptchaImage {
    url: string | null;
    width: number | null;
}

export interface IImageCaptchaStore {
    readonly image: Readonly<ICaptchaImage> | null;
    readonly key: string | null;
}

export function imageCaptcha(state: IImageCaptchaStore = {
    image: null,
    key: null,
}, action: IJodelAction): typeof state {
    switch (action.type) {
        case SET_IMAGE_CAPTCHA:
            if (!action.payload) {
                return state;
            }
            return {
                image: {
                    url: action.payload.imageUrl || null,
                    width: action.payload.imageWidth || null,
                },
                key: action.payload.key || null,
            };
        default:
            return state;
    }
}
