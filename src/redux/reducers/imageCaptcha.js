import Immutable from "immutable";
import {SET_IMAGE_CAPTCHA} from "../actions/state";

export default function imageCaptcha(state = Immutable.Map({
    key: null,
    image: Immutable.Map({url: null, width: null}),
}), action) {
    switch (action.type) {
        case SET_IMAGE_CAPTCHA:
            return state.update("image", image => Immutable.Map({url: action.imageUrl, width: action.imageWidth}))
                .set("key", action.key);
        default:
            return state
    }
}
