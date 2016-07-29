'use strict';
require("es6-shim");

import React, {Component} from "react";
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

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
