import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { JodelApi } from '../app/api';

import { IJodelAppStore } from '../redux/reducers';
import { IJodelAction } from './IJodelAction';

interface IExtraArgument {
    api: JodelApi;
}

export type JodelThunkAction<R = void> = ThunkAction<R, IJodelAppStore, IExtraArgument, IJodelAction>;
export type JodelThunkDispatch = ThunkDispatch<IJodelAppStore, IExtraArgument, IJodelAction>;
