'use strict';
require("babel-polyfill");

import React, {Component} from "react";
import {refreshAccessToken} from "../redux/actions/api";
import {migrateViewState, VIEW_STATE_VERSION} from "../redux/reducers/viewState";
import {migrateAccount, ACCOUNT_VERSION} from "../redux/reducers/account";
import {fetchPostsIfNeeded, updateLocation, getConfig, setDeviceUid} from "../redux/actions";
import ReactDOM from "react-dom";
import DocumentTitle from "react-document-title";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";
import Jodel from "../views/Jodel";
import JodelApp from "../redux/reducers";

let persistedState = {};
if (localStorage.getItem('viewState')) {
    let oldVersion = parseInt(localStorage.getItem('viewStateVersion'), 10);
    persistedState.viewState = migrateViewState(JSON.parse(localStorage.getItem('viewState')), oldVersion);
}

if (localStorage.getItem('account')) {
    let oldVersion = parseInt(localStorage.getItem('accountVersion'), 10);
    persistedState.account = migrateAccount(JSON.parse(localStorage.getItem('account')), oldVersion);
}

let store = createStore(
    JodelApp,
    persistedState,
    applyMiddleware(
        thunkMiddleware, // lets us use dispatch() functions
    )
);

store.subscribe(()=> {
    localStorage.setItem('viewState', JSON.stringify(store.getState().viewState));
    localStorage.setItem('viewStateVersion', VIEW_STATE_VERSION);

    localStorage.setItem('account', JSON.stringify(store.getState().account));
    localStorage.setItem('accountVersion', ACCOUNT_VERSION);
});

if (store.getState().account.token === undefined || store.getState().account.token.access === undefined) {
    if (store.getState().account.deviceUid !== undefined) {
        store.dispatch(setDeviceUid(store.getState().account.deviceUid));
    }
} else {
    const now = new Date().getTime() / 1000;
    if (now >= store.getState().account.token.expirationDate) {
        store.dispatch(refreshAccessToken());
    } else {
        store.dispatch(getConfig());
        store.dispatch(fetchPostsIfNeeded());
    }
}
store.dispatch(updateLocation());

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
