import {SET_IMAGE_CAPTCHA} from '../actions/state';

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
}, action) {
    switch (action.type) {
    case SET_IMAGE_CAPTCHA:
        return {
            image: {
                url: action.imageUrl,
                width: action.imageWidth,
            },
            key: action.key,
        };
    default:
        return state;
    }
}
