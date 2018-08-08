// noinspection TsLint
import './app/polyfills.ts';

import 'normalize.css';
import '../style/main.scss';

import './app/main';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';

if (process.env.NODE_ENV === 'production') {
    OfflinePluginRuntime.install({
        onUpdating: () => {
        },
        // tslint:disable-next-line:object-literal-sort-keys
        onUpdateReady: () => {
            // Tells to new SW to take control immediately
            OfflinePluginRuntime.applyUpdate();
        },
        onUpdated: () => {
            // Reload the webpage to load into the new version
            // TODO: show an update notification with button, or reload on user navigation
            window.location.reload();
        },
        onUpdateFailed: () => {
        },
    });
}
