// noinspection TsLint
import 'normalize.css';

import '../style/main.scss';
import './app/main';

if (process.env.NODE_ENV === 'production') {
    let serviceWorkerRegistered = false;
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    serviceWorkerRegistered = true;
                    reg.addEventListener('updatefound', () => {
                        console.info('[SW] Update found');
                        const newSW = reg.installing;
                        newSW?.addEventListener('statechange', e => {
                            if (newSW?.state === 'installed') {
                                console.info('[SW] Reloading to update');
                                window.location.reload();
                            }
                        });
                    });
                })
                .catch(() => {
                    // Failed to register service worker, maybe blocked by user agent
                    serviceWorkerRegistered = false;
                });
        });

        document.addEventListener('visibilitychange', async () => {
            if (serviceWorkerRegistered && !document.hidden) {
                (await navigator.serviceWorker.getRegistration())?.update();
            }
        });
    }
}
