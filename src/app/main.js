'use strict';
require("babel-polyfill");

import React, {Component} from "react";
import {
    showAddPost,
    showSettings,
    selectPicture,
    showChannelList,
    switchPostSection,
    selectPost,
    setPermissionDenied,
    fetchPostsIfNeeded,
    updateLocation,
    getConfig,
    switchPostListSortType
} from "../redux/actions";
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
let storedViewState = localStorage.getItem('viewState');
if (storedViewState) {
    let oldVersion = parseInt(localStorage.getItem('viewStateVersion'), 10);
    persistedState.viewState = Immutable.fromJS(migrateViewState(JSON.parse(storedViewState), oldVersion));
}

let storedAccount = localStorage.getItem('account');
if (storedAccount) {
    let oldVersion = parseInt(localStorage.getItem('accountVersion'), 10);
    persistedState.account = Immutable.fromJS(migrateAccount(JSON.parse(storedAccount), oldVersion));
}

let store = createStore(
    JodelApp,
    persistedState,
    applyMiddleware(
        thunkMiddleware, // lets us use dispatch() functions
    )
);

store.subscribe(() => {
    localStorage.setItem('viewState', JSON.stringify(store.getState().viewState));
    localStorage.setItem('viewStateVersion', VIEW_STATE_VERSION);

    localStorage.setItem('account', JSON.stringify(store.getState().account));
    localStorage.setItem('accountVersion', ACCOUNT_VERSION);
});

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
    history.replaceState({
        postSection: "location",
        postListSortType: store.getState().viewState.get("postListSortType")
    }, "");
    store.dispatch(switchPostSection("location"));
}

window.onpopstate = event => {
    if (event.state.postSection !== undefined && event.state.postSection !== store.getState().viewState.get("postSection")) {
        store.dispatch(switchPostSection(event.state.postSection, true));
    }
    if (event.state.postListSortType !== undefined && event.state.postListSortType !== store.getState().viewState.get("postListSortType")) {
        store.dispatch(switchPostListSortType(event.state.postListSortType, true));
    }
    if (event.state.selectedPostId === undefined) {
        event.state.selectedPostId = null;
    }
    if (event.state.selectedPostId !== store.getState().viewState.get("selectedPostId")) {
        store.dispatch(selectPost(event.state.selectedPostId, true));
    }
    if (event.state.selectedPicturePostId === undefined) {
        event.state.selectedPicturePostId = null;
    }
    if (event.state.selectedPicturePostId !== store.getState().viewState.get("selectedPicturePostId")) {
        store.dispatch(selectPicture(event.state.selectedPicturePostId, true));
    }
    if (event.state.settingsVisible === undefined) {
        event.state.settingsVisible = false;
    }
    if (event.state.settingsVisible !== store.getState().viewState.getIn(["settings", "visible"])) {
        store.dispatch(showSettings(event.state.settingsVisible, true));
    }
    if (event.state.addPostVisible === undefined) {
        event.state.addPostVisible = false;
    }
    if (event.state.addPostVisible !== store.getState().viewState.getIn(["addPost", "visible"])) {
        store.dispatch(showAddPost(event.state.addPostVisible, true));
    }
    if (event.state.channelListVisible === undefined) {
        event.state.channelListVisible = false;
    }
    if (event.state.channelListVisible !== store.getState().viewState.getIn(["channelList", "visible"])) {
        store.dispatch(showChannelList(event.state.channelListVisible, true));
    }
};

ReactDOM.render(<Provider store={store}><DocumentTitle
    title="Jodel Unofficial WebApp"><Jodel/></DocumentTitle></Provider>, document.getElementById('content'));
