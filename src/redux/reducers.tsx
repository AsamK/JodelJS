import {combineReducers} from 'redux';

import {ILocation} from '../interfaces/ILocation';
import {account, IAccountStore} from './reducers/account';
import {entities, IEntitiesStore} from './reducers/entities';
import {IImageCaptchaStore, imageCaptcha} from './reducers/imageCaptcha';
import {IPostsBySectionStore, postsBySection} from './reducers/postsBySection';
import {ISettingsStore, settings} from './reducers/settings';
import {IViewStateStore, viewState} from './reducers/viewState';

export interface IJodelAppStore {
    entities: IEntitiesStore;
    postsBySection: IPostsBySectionStore;
    viewState: IViewStateStore;
    account: IAccountStore;
    settings: ISettingsStore;
    imageCaptcha: IImageCaptchaStore;
}

export const JodelApp = combineReducers<IJodelAppStore>({
    entities,
    postsBySection,
    viewState,
    account,
    settings,
    imageCaptcha,
});

export function getLocation(store: IJodelAppStore): ILocation | null {
    return store.settings.location;
}

export function isLocationKnown(store: IJodelAppStore): boolean {
    return !!getLocation(store);
}
