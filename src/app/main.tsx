if (!(window as any).Uint8Array) {
    // Polyfill for IE9
    (window as any).Uint8Array = require('typedarray').Uint8Array;
}

import * as React from 'react';
import DocumentTitle = require('react-document-title/index');
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore, Middleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {
    fetchPostsIfNeeded,
    getConfig,
    replaceViewState,
    selectPostFromNotification,
    setPermissionDenied,
    switchPostSection,
    updateLocation,
} from '../redux/actions';
import {getKarma, getNotifications, refreshAccessToken} from '../redux/actions/api';
import {IJodelAppStore, JodelApp} from '../redux/reducers';
import {ACCOUNT_VERSION, migrateAccount} from '../redux/reducers/account';
import {migrateSettings, SETTINGS_VERSION} from '../redux/reducers/settings';
import {getNotificationDescription} from '../utils/notification.utils';
import {Jodel} from '../views/Jodel';

const persistedState: Partial<IJodelAppStore> = {};

const storedAccount = localStorage.getItem('account');
if (storedAccount) {
    const oldVersion = parseInt(localStorage.getItem('accountVersion') || '0', 10);
    persistedState.account = migrateAccount(JSON.parse(storedAccount), oldVersion);
}

const storedSettings = localStorage.getItem('settings');
if (storedSettings) {
    const oldVersion = parseInt(localStorage.getItem('settingsVersion') || '0', 10);
    persistedState.settings = migrateSettings(JSON.parse(storedSettings), oldVersion);
}

const reduxMiddlewares: Middleware[] = [
    thunkMiddleware, // lets us use dispatch() functions
];

if (process.env.NODE_ENV !== 'production') {
    // Freeze redux state in development to prevent accidental modifications
    // Disable in production to improve performance
    const freeze = require('redux-freeze');
    reduxMiddlewares.push(freeze);
}

const composeEnhancers = (process.env.NODE_ENV !== 'production' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const store = createStore<IJodelAppStore>(
    JodelApp,
    persistedState as IJodelAppStore,
    composeEnhancers(
        applyMiddleware(
            ...reduxMiddlewares,
        ),
    ),
);

let userClickedBack = false;
store.subscribe((() => {
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
            if (previousState.entities.notifications !== state.entities.notifications && 'Notification' in window) {
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
                    .filter(n => 10 * 60 * 1000 > (Date.now() - new Date(n.last_interaction).getTime()));
                Notification.requestPermission(function(permission) {
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
                        },
                    );
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
    if (now > account.token.expirationDate - timeToExpire) {
        store.dispatch(refreshAccessToken());
    } else {
        store.dispatch(fetchPostsIfNeeded());
    }
    store.dispatch(getConfig());
    store.dispatch(getNotifications());
    store.dispatch(getKarma());
}
store.dispatch(updateLocation());

if (history.state === null) {
    history.replaceState(store.getState().viewState, '');
    store.dispatch(switchPostSection('location'));
} else {
    userClickedBack = true;
    store.dispatch(replaceViewState(history.state));
}

window.onpopstate = event => {
    userClickedBack = true;
    store.dispatch(replaceViewState(event.state));
};

ReactDOM.render(<Provider store={store}>
    <DocumentTitle title="Jodel Unofficial WebApp">
        <Jodel/>
    </DocumentTitle>
</Provider>, document.getElementById('content'));
