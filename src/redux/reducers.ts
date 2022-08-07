import { combineReducers } from 'redux';

import type { IJodelAction } from '../interfaces/IJodelAction';
import type { IToast } from '../interfaces/IToast';

import type { IAccountStore } from './reducers/account';
import { account } from './reducers/account';
import type { IEntitiesStore } from './reducers/entities';
import { entities } from './reducers/entities';
import type { IPostsBySectionStore} from './reducers/postsBySection';
import { postsBySection } from './reducers/postsBySection';
import type { ISettingsStore} from './reducers/settings';
import { settings } from './reducers/settings';
import { toasts } from './reducers/toasts';
import type { IViewStateStore} from './reducers/viewState';
import { viewState } from './reducers/viewState';

export type IJodelAppStore = Readonly<IJodelAppStoreMutable>;

interface IJodelAppStoreMutable {
    entities: IEntitiesStore;
    postsBySection: IPostsBySectionStore;
    viewState: IViewStateStore;
    account: IAccountStore;
    settings: ISettingsStore;
    toasts: readonly IToast[];
}

export const JodelApp = combineReducers<IJodelAppStore, IJodelAction>({
    account,
    entities,
    postsBySection,
    settings,
    toasts,
    viewState,
});
