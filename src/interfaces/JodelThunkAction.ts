import type { ThunkAction, ThunkDispatch } from 'redux-thunk';

import type { JodelApi } from '../app/api';
import type { IJodelAppStore } from '../redux/reducers';

import type { IJodelAction } from './IJodelAction';

interface IExtraArgument {
    api: JodelApi;
}

export type JodelThunkAction<R = void> = ThunkAction<R, IJodelAppStore, IExtraArgument, IJodelAction>;
export type JodelThunkDispatch = ThunkDispatch<IJodelAppStore, IExtraArgument, IJodelAction>;
