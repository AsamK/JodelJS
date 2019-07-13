import { combineReducers } from 'redux';

import { IJodelAction } from '../interfaces/IJodelAction';
import { IToast } from '../interfaces/IToast';
import { account, IAccountStore } from './reducers/account';
import { entities, IEntitiesStore } from './reducers/entities';
import { IPostsBySectionStore, postsBySection } from './reducers/postsBySection';
import { ISettingsStore, settings } from './reducers/settings';
import { toasts } from './reducers/toasts';
import { IViewStateStore, viewState } from './reducers/viewState';

export type IJodelAppStore = Readonly<IJodelAppStoreMutable>;

interface IJodelAppStoreMutable {
    entities: IEntitiesStore;
    postsBySection: IPostsBySectionStore;
    viewState: IViewStateStore;
    account: IAccountStore;
    settings: ISettingsStore;
    toasts: ReadonlyArray<IToast>;
}

export const JodelApp = combineReducers<IJodelAppStore, IJodelAction>({
    account,
    entities,
    postsBySection,
    settings,
    toasts,
    viewState,
});
