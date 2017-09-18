import {combineReducers} from 'redux';
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
