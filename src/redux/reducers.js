import {combineReducers} from "redux";
import entities from "./reducers/entities";
import postsBySection from "./reducers/postsBySection";
import viewState from "./reducers/viewState";
import account from "./reducers/account";

const JodelApp = combineReducers({
    entities,
    postsBySection,
    viewState,
    account,
});

export function getLocation(store) {
    let result = store.viewState.get("location");
    return result;
}

export function isLocationKnown(store) {
    const loc = getLocation(store);
    return loc != undefined && loc.get("latitude") != undefined;
}

export default JodelApp;
