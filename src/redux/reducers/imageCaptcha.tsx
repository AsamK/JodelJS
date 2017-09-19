import {IJodelAction} from '../../interfaces/IJodelAction';
import {SET_IMAGE_CAPTCHA} from '../actions/action.consts';

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
            return {
                image: {
                    url: action.payload.imageUrl,
                    width: action.payload.imageWidth,
                },
                key: action.payload.key,
            };
        default:
            return state;
    }
}
