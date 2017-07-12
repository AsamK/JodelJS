import * as Immutable from 'immutable';
import {combineReducers} from 'redux';
import {account, IAccountStore} from './reducers/account';
import {entities, IEntitiesStore} from './reducers/entities';
import {IImageCaptchaStore, imageCaptcha} from './reducers/imageCaptcha';
import {postsBySection, IPostsBySectionStore} from './reducers/postsBySection';
import settings from './reducers/settings';
import viewState from './reducers/viewState';

export interface IJodelAppStore {
    entities: IEntitiesStore,
    postsBySection: IPostsBySectionStore,
    viewState: any,
    account: IAccountStore,
    settings: any,
    imageCaptcha: IImageCaptchaStore,
}

export const JodelApp = combineReducers<IJodelAppStore>({
    entities,
    postsBySection,
    viewState,
    account,
    settings,
    imageCaptcha,
});

export function getLocation(store) {
    let result = store.settings.get('location');
    if (result === undefined) {
        result = store.viewState.get('location');
        if (result === undefined) {
            result = Immutable.Map();
        }
    } else if (result.get('latitude') === undefined && store.viewState.has('location')) {
        result = store.viewState.get('location');
    }
    return result;
}

export function isLocationKnown(store) {
    const loc = getLocation(store);
    return loc != undefined && loc.get('latitude') != undefined;
}
