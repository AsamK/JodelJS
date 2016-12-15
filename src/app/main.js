'use strict';
require("babel-polyfill");

import React, {Component} from "react";
import {
    replaceViewState,
    switchPostSection,
    setPermissionDenied,
    fetchPostsIfNeeded,
    updateLocation,
    getConfig
} from "../redux/actions";
import {refreshAccessToken} from "../redux/actions/api";
import {migrateAccount, ACCOUNT_VERSION} from "../redux/reducers/account";
import {migrateSettings, SETTINGS_VERSION} from "../redux/reducers/settings";
import ReactDOM from "react-dom";
import DocumentTitle from "react-document-title";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";
import Jodel from "../views/Jodel";
import JodelApp from "../redux/reducers";
import Immutable from "immutable";

let persistedState = {};

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
    )
);
store.dispatch({type: "INIT"});
let userClickedBack = false;
store.subscribe((() => {
        let previousState = store.getState();
        return () => {
            let state = store.getState();
            localStorage.setItem('account', JSON.stringify(state.account));
            localStorage.setItem('accountVersion', ACCOUNT_VERSION);

            localStorage.setItem('settings', JSON.stringify(state.settings));
            localStorage.setItem('settingsVersion', SETTINGS_VERSION);

            if (!previousState.viewState.equals(state.viewState)) {
                if (userClickedBack) {
                    userClickedBack = false;
                } else {
                    history.pushState(state.viewState.toJS(), "");
                }
            }
            previousState = state;
        }
    })()
);

if (store.getState().account.getIn(["token", "access"]) === undefined) {
    if (store.getState().account.get("deviceUid") !== undefined) {
        store.dispatch(setPermissionDenied(true));
    }
} else {
    const now = new Date().getTime() / 1000;
    let timeToExpire = 60 * 60 * 24 * 4;
    if (now > store.getState().account.getIn(["token", "expirationDate"]) - timeToExpire) {
        store.dispatch(refreshAccessToken());
    } else {
        store.dispatch(getConfig());
        store.dispatch(fetchPostsIfNeeded());
    }
}
store.dispatch(updateLocation());

if (history.state === null) {
    history.replaceState(store.getState().viewState.toJS(), "");
    store.dispatch(switchPostSection("location"));
} else {
    store.dispatch(replaceViewState(history.state));
}

window.onpopstate = event => {
    userClickedBack = true;
    store.dispatch(replaceViewState(event.state));
};

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
