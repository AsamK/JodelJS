'use strict';
require("es6-shim");

import React, {Component} from "react";
import ReactDOM from "react-dom";
import DocumentTitle from "react-document-title";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";
import Jodel from "../views/Jodel";
import JodelApp from "../redux/reducers";

let store = createStore(
    JodelApp,
    applyMiddleware(
        thunkMiddleware, // lets us dispatch() functions
    )
);

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
