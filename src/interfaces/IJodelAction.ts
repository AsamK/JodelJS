import {Action} from 'redux';

export interface IJodelAction extends Action {
    // FIXME: Disabled because of incomplete redux typings, will be fixed with redux 4.0
    payload?: any
    receivedAt?: number
}
// export type IJodelAction = any;