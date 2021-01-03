/// <reference lib="es2015" />
/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;
import { } from '.';

type ManifestEntry = {
    url: string;
    revision: string;
};

const INJECTED_MANIFEST: ManifestEntry[] = (self as any).__WB_MANIFEST;
const CACHE_NAME = 'jodel-cache-v1';
const META_ENTRY = '__meta-data__';
const NAVIGATE_TARGET = '.';

const MANIFEST = INJECTED_MANIFEST
    .map(entry => ({ ...entry, url: new URL(entry.url, location.toString()).toString() }));

const metadataMap = manifestToMap(MANIFEST);

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(precache().catch(e => console.error('SW precache failed: ' + JSON.stringify(e))));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    if (metadataMap.has(event.request.url)) {
        event.respondWith(fromCacheFallbackNetwork(event.request));
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(fromCacheFallbackNetwork(NAVIGATE_TARGET));
    }
});

async function precache(): Promise<void> {
    const cache = await caches.open(CACHE_NAME);

    let oldMetadata;
    try {
        oldMetadata = manifestToMap(await getCurrentMetadata());
    } catch (e) {
        console.warn('[SW] Invalid cache metadata', e);
        oldMetadata = new Map();
    }

    const waitFor = [];
    // Add navigate target
    waitFor.push(cache.add(NAVIGATE_TARGET));

    // Add new assets
    for (const entry of MANIFEST) {
        if (entry.revision === oldMetadata.get(entry.url)) {
            continue;
        }
        waitFor.push(cache.add(entry.url));
    }

    // Cleanup old assets
    for (const oldEntryUrl of oldMetadata.keys()) {
        if (metadataMap.has(oldEntryUrl)) {
            continue;
        }

        waitFor.push(cache.delete(oldEntryUrl).then(() => { /*ignore*/ }));
    }

    await Promise.all(waitFor);
    await storeCurrentMetadata(MANIFEST);
}

async function fromCacheFallbackNetwork(request: RequestInfo): Promise<Response> {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(request);

    return response || fetch(request);
}

async function getCurrentMetadata(): Promise<ManifestEntry[]> {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(META_ENTRY);

    if (!response) {
        return [];
    }

    return await response.json();
}

async function storeCurrentMetadata(manifest: ManifestEntry[]): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(META_ENTRY, new Response(JSON.stringify(manifest)));
}

function manifestToMap(manifest: ManifestEntry[]): Map<string, string> {
    const map = new Map();
    for (const entry of manifest) {
        map.set(entry.url, entry.revision);
    }
    return map;
}
