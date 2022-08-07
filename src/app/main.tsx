import React from 'react';
import ReactDOM from 'react-dom';
import type { Middleware } from 'redux';
import { applyMiddleware, compose, createStore } from 'redux';
import freeze from 'redux-freeze';
import thunkMiddleware from 'redux-thunk';

import type { IJodelAction } from '../interfaces/IJodelAction';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import {
    fetchPostsIfNeeded,
    getConfig,
    replaceViewState,
    selectPostFromNotification,
    setPermissionDenied,
    switchPostSection,
    updateLocation,
} from '../redux/actions';
import { getKarma, getNotifications, refreshAccessToken } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';
import { JodelApp } from '../redux/reducers';
import type { IAccountStore } from '../redux/reducers/account';
import { ACCOUNT_VERSION, migrateAccount } from '../redux/reducers/account';
import type { ISettingsStore } from '../redux/reducers/settings';
import { migrateSettings, SETTINGS_VERSION } from '../redux/reducers/settings';
import type { IViewStateStore } from '../redux/reducers/viewState';
import { getNotificationDescription } from '../utils/notification.utils';
import { App } from '../views/App';

import { JodelApi } from './api';

let persistedStateAccount: IAccountStore | undefined;
const storedAccount = localStorage.getItem('account');
if (storedAccount) {
    const oldVersion = parseInt(localStorage.getItem('accountVersion') || '0', 10);
    persistedStateAccount = migrateAccount(JSON.parse(storedAccount) as IAccountStore, oldVersion);
}

let persistedStateSettings: ISettingsStore | undefined;
const storedSettings = localStorage.getItem('settings');
if (storedSettings) {
    const oldVersion = parseInt(localStorage.getItem('settingsVersion') || '0', 10);
    persistedStateSettings = migrateSettings(
        JSON.parse(storedSettings) as ISettingsStore,
        oldVersion,
    );
}

const persistedState: Partial<IJodelAppStore> = {
    account: persistedStateAccount,
    settings: persistedStateSettings,
};

const extraThunkArgument: { api?: JodelApi } = {};
const reduxMiddlewares: Middleware[] = [
    thunkMiddleware.withExtraArgument(extraThunkArgument), // lets us use dispatch() functions
];

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (process.env.NODE_ENV !== 'production') {
    // Freeze redux state in development to prevent accidental modifications
    // Disable in production to improve performance
    reduxMiddlewares.push(freeze);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const composeEnhancers =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (process.env.NODE_ENV !== 'production' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;
const store = createStore<IJodelAppStore, IJodelAction, { dispatch: JodelThunkDispatch }, unknown>(
    JodelApp,
    persistedState as IJodelAppStore,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    composeEnhancers(applyMiddleware(...reduxMiddlewares)),
);

const api = new JodelApi(store);
extraThunkArgument.api = api;

let userClickedBack = false;
store.subscribe(
    (() => {
        let previousState = store.getState();
        const shownNotifications: { [notificationId: string]: Notification | null } = {};

        return () => {
            const state = store.getState();
            localStorage.setItem('account', JSON.stringify(state.account));
            localStorage.setItem('accountVersion', ACCOUNT_VERSION.toString());

            localStorage.setItem('settings', JSON.stringify(state.settings));
            localStorage.setItem('settingsVersion', SETTINGS_VERSION.toString());

            if (previousState.viewState !== state.viewState) {
                if (userClickedBack) {
                    userClickedBack = false;
                } else {
                    history.pushState(state.viewState, '');
                }
            }
            if (
                previousState.entities.notifications !== state.entities.notifications &&
                'Notification' in window
            ) {
                state.entities.notifications
                    .filter(n => n.read)
                    .forEach(n => {
                        const notification = shownNotifications[n.notification_id];
                        if (!notification) {
                            return;
                        }
                        notification.close();
                        shownNotifications[n.notification_id] = null;
                    });

                const newNotifications = state.entities.notifications
                    .filter(n => !n.read)
                    .filter(
                        n => 10 * 60 * 1000 > Date.now() - new Date(n.last_interaction).getTime(),
                    );
                Notification.requestPermission(permission => {
                    if (permission !== 'granted') {
                        return;
                    }
                    newNotifications.forEach(n => {
                        const oldNotification = shownNotifications[n.notification_id];
                        if (oldNotification) {
                            if (oldNotification.body === n.message) {
                                return;
                            }
                            oldNotification.close();
                        }
                        const notification = new Notification(getNotificationDescription(n), {
                            body: n.message,
                            tag: n.notification_id,
                        });
                        notification.onclick = () => {
                            store.dispatch(selectPostFromNotification(n.post_id));
                        };
                        shownNotifications[n.notification_id] = notification;
                    });
                });
            }

            previousState = state;
        };
    })(),
);

const account = store.getState().account;
if (!account.token || !account.token.access) {
    if (account.deviceUid) {
        store.dispatch(setPermissionDenied(true));
    }
} else {
    const now = new Date().getTime() / 1000;
    const timeToExpire = 60 * 60 * 24 * 4;
    if (account.permissionDenied || now > account.token.expirationDate - timeToExpire) {
        store.dispatch(refreshAccessToken());
    } else {
        store.dispatch(fetchPostsIfNeeded());
        store.dispatch(getConfig());
        store.dispatch(getNotifications());
        store.dispatch(getKarma());
    }
}
store.dispatch(updateLocation());

if (history.state === null) {
    history.replaceState(store.getState().viewState, '');
    store.dispatch(switchPostSection('location'));
} else {
    userClickedBack = true;
    store.dispatch(replaceViewState(history.state as IViewStateStore));
}

window.onpopstate = (event: PopStateEvent) => {
    userClickedBack = true;
    store.dispatch(replaceViewState(event.state as IViewStateStore));
};

const translationLocale: string =
    navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage;
const translationLanguage = translationLocale ? translationLocale.substring(0, 2) : 'en';

let translationMessages: Promise<{ [key: string]: string }>;
switch (translationLanguage) {
    case 'de':
        translationMessages = import(
            /* webpackChunkName: "messages-de" */ '../translations/de'
        ).then(m => m.default);
        break;
    case 'en':
    default:
        translationMessages = Promise.resolve({});
        break;
}

translationMessages
    .catch(() => ({}))
    .then(messages => {
        ReactDOM.render(
            <App locale={translationLocale} messages={messages} store={store} />,
            document.getElementById('content'),
        );
    });
