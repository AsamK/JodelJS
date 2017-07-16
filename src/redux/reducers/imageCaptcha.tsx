import {SET_IMAGE_CAPTCHA} from '../actions/state';
import {IJodelAction} from '../../interfaces/IJodelAction';

export interface ICaptchaImage {
    url: string
    width: number
}

export interface IImageCaptchaStore {
    key: string | null
    image: ICaptchaImage | null
}

export function imageCaptcha(state: IImageCaptchaStore = {
    key: null,
    image: null,
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
