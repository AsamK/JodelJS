import {combineReducers} from 'redux';

import {ILocation} from '../interfaces/ILocation';
import {IToast} from '../interfaces/IToast';
import {account, IAccountStore} from './reducers/account';
import {entities, IEntitiesStore} from './reducers/entities';
import {IImageCaptchaStore, imageCaptcha} from './reducers/imageCaptcha';
import {IPostsBySectionStore, postsBySection} from './reducers/postsBySection';
import {ISettingsStore, settings} from './reducers/settings';
import {toasts} from './reducers/toasts';
import {IViewStateStore, viewState} from './reducers/viewState';

export interface IJodelAppStore {
    entities: IEntitiesStore;
    postsBySection: IPostsBySectionStore;
    viewState: IViewStateStore;
    account: IAccountStore;
    settings: ISettingsStore;
    imageCaptcha: IImageCaptchaStore;
    toasts: IToast[];
}

export const JodelApp = combineReducers<IJodelAppStore>({
    account,
    entities,
    imageCaptcha,
    postsBySection,
    settings,
    toasts,
    viewState,
});

export function getLocation(store: IJodelAppStore): ILocation | null {
    return store.settings.location;
}

export function isLocationKnown(store: IJodelAppStore): boolean {
    return !!getLocation(store);
}
