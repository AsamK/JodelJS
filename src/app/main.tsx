require('babel-polyfill');

import * as Immutable from 'immutable';
import * as React from 'react';
import * as DocumentTitle from 'react-document-title';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {
    fetchPostsIfNeeded,
    getConfig,
    replaceViewState,
    setPermissionDenied,
    switchPostSection,
    updateLocation
} from '../redux/actions';
import {refreshAccessToken} from '../redux/actions/api';
import JodelApp from '../redux/reducers';
import {ACCOUNT_VERSION, migrateAccount} from '../redux/reducers/account';
import {migrateSettings, SETTINGS_VERSION} from '../redux/reducers/settings';
import Jodel from '../views/Jodel';

let persistedState: any = {};

let storedAccount = localStorage.getItem('account');
if (storedAccount) {
    let oldVersion = parseInt(localStorage.getItem('accountVersion'), 10);
    persistedState.account = Immutable.fromJS(migrateAccount(JSON.parse(storedAccount), oldVersion));
}

let storedSettings = localStorage.getItem('settings');
if (storedSettings) {
    let oldVersion = parseInt(localStorage.getItem('settingsVersion'), 10);
    persistedState.settings = Immutable.fromJS(migrateSettings(JSON.parse(storedSettings), oldVersion));
}

let store = createStore(
    JodelApp,
    persistedState,
    applyMiddleware(
        thunkMiddleware, // lets us use dispatch() functions
    ),
);
store.dispatch({type: 'INIT'});
let userClickedBack = false;
store.subscribe((() => {
        let previousState = store.getState();
        return () => {
            let state = store.getState();
            localStorage.setItem('account', JSON.stringify(state.account));
            localStorage.setItem('accountVersion', ACCOUNT_VERSION.toString());

            localStorage.setItem('settings', JSON.stringify(state.settings));
            localStorage.setItem('settingsVersion', SETTINGS_VERSION.toString());

            if (!previousState.viewState.equals(state.viewState)) {
                if (userClickedBack) {
                    userClickedBack = false;
                } else {
                    history.pushState(state.viewState.toJS(), '');
                }
            }
            previousState = state;
        };
    })(),
);

if (store.getState().account.getIn(['token', 'access']) === undefined) {
    if (store.getState().account.get('deviceUid') !== undefined) {
        store.dispatch(setPermissionDenied(true));
    }
} else {
    const now = new Date().getTime() / 1000;
    let timeToExpire = 60 * 60 * 24 * 4;
    if (now > store.getState().account.getIn(['token', 'expirationDate']) - timeToExpire) {
        store.dispatch(refreshAccessToken());
    } else {
        store.dispatch(getConfig());
        store.dispatch(fetchPostsIfNeeded());
    }
}
store.dispatch(updateLocation());

if (history.state === null) {
    history.replaceState(store.getState().viewState.toJS(), '');
    store.dispatch(switchPostSection('location'));
} else {
    userClickedBack = true;
    store.dispatch(replaceViewState(history.state));
}

window.onpopstate = event => {
    userClickedBack = true;
    store.dispatch(replaceViewState(event.state));
};

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));