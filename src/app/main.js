'use strict';
require("babel-polyfill");

import React, {Component} from "react";
import {_switchPostSection, setPermissionDenied, fetchPostsIfNeeded, updateLocation, getConfig} from "../redux/actions";
import {refreshAccessToken} from "../redux/actions/api";
import {migrateViewState, VIEW_STATE_VERSION} from "../redux/reducers/viewState";
import {migrateAccount, ACCOUNT_VERSION} from "../redux/reducers/account";
import ReactDOM from "react-dom";
import DocumentTitle from "react-document-title";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";
import Jodel from "../views/Jodel";
import JodelApp from "../redux/reducers";
import Immutable from "immutable";

let persistedState = {};
if (localStorage.getItem('viewState')) {
    let oldVersion = parseInt(localStorage.getItem('viewStateVersion'), 10);
    persistedState.viewState = Immutable.fromJS(migrateViewState(JSON.parse(localStorage.getItem('viewState')), oldVersion));
}

if (localStorage.getItem('account')) {
    let oldVersion = parseInt(localStorage.getItem('accountVersion'), 10);
    persistedState.account = Immutable.fromJS(migrateAccount(JSON.parse(localStorage.getItem('account')), oldVersion));
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

store.dispatch(_switchPostSection("location"));
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

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
