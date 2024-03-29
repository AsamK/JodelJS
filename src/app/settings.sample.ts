import type { ISettings } from '../interfaces/ISettings';

const Settings: ISettings = {
    // API Server and Path
    API_SERVER: 'https://api.jodelapis.com/api',

    // Android client id
    CLIENT_ID: '81e8a76e-1e02-4d17-9ba0-8a7020261b26',

    // Client type for signed requests
    CLIENT_TYPE: 'android_8.4.0',

    // Default location, if browser location is not available
    DEFAULT_LOCATION: undefined,

    // Helper server url to create GCM account
    GCM_ACCOUNT_HELPER_URL: 'http://127.0.0.1:9090/account',

    // Helper server url to receive GCM verification message
    GCM_RECEIVE_HELPER_URL: 'http://127.0.0.1:9090/verification',

    EMAIL_REQUEST_HELPER_URL: 'http://127.0.0.1:9090/email/request',
    EMAIL_CONFIRM_HELPER_URL: 'http://127.0.0.1:9090/email/confirm',

    // Key for signed requests
    KEY: 'GNyUrEmBdEkihJOIoUTXbCQmBpDSxfFNGCuaWAUH',

    // Colors for posts, the Server prevents other colors
    POST_COLORS: ['06A3CB', 'DD5F5F', 'FFBA00', 'FF9908', '8ABDB0', '9EC41C'],
};

export default Settings;
