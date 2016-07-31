'use strict';
require("es6-shim");

import React, {Component} from "react";
import {fetchPostsIfNeeded, updateLocation, getConfig, setDeviceUid, createNewAccount} from "../redux/actions";
import ReactDOM from "react-dom";
import DocumentTitle from "react-document-title";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";
import Jodel from "../views/Jodel";
import JodelApp, {VIEW_STATE_VERSION, migrateViewState} from "../redux/reducers";

let persistedState = {};
if (localStorage.getItem('viewState')) {
    let oldVersion = parseInt(localStorage.getItem('viewStateVersion'), 10);
    persistedState.viewState = migrateViewState(JSON.parse(localStorage.getItem('viewState')), oldVersion);
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
});

if (store.getState().account.token === undefined || store.getState().account.token.access === undefined) {
    if (store.getState().account.deviceUid === undefined) {
        store.dispatch(createNewAccount());
    } else {
        store.dispatch(setDeviceUid(store.getState().account.deviceUid));
    }
} else {
    store.dispatch(getConfig());
    store.dispatch(updateLocation());
    store.dispatch(fetchPostsIfNeeded());
}

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
