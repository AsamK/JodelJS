import { Color } from '../enums/Color';

export interface ISettings {
    API_SERVER: string;
    CLIENT_ID: string;
    CLIENT_TYPE: string;
    DEFAULT_LOCATION?: { latitude: number, longitude: number };
    GCM_ACCOUNT_HELPER_URL: string;
    GCM_RECEIVE_HELPER_URL: string;
    KEY: string;
    POST_COLORS: Color[];
}
