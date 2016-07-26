'use strict';
require("es6-shim");

import React, {Component} from "react";
import ReactDOM from "react-dom";
import Jodel from "../views/Jodel";
import DocumentTitle from "react-document-title";

ReactDOM.render(<DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle>, document.getElementById('content'));
