import createHmac from 'create-hmac';
import { Store } from 'redux';

import { ApiAction } from '../enums/ApiAction';
import { Color } from '../enums/Color';
import { PostListPostType } from '../enums/PostListPostType';
import { PostListSortType } from '../enums/PostListSortType';
import { UserType } from '../enums/UserType';
import { IApiChannelPostListCombo } from '../interfaces/IApiChannelPostListCombo';
import { IApiChannelsMeta } from '../interfaces/IApiChannelsMeta';
import { IApiConfig } from '../interfaces/IApiConfig';
import { IApiAndroidAccount, IApiGcmAccount } from '../interfaces/IApiGcmAccount';
import { IApiGcmVerification } from '../interfaces/IApiGcmVerification';
import { IApiHashtagPostListCombo } from '../interfaces/IApiHashtagPostListCombo';
import { IApiKarma } from '../interfaces/IApiKarma';
import { IApiLocationPostListCombo } from '../interfaces/IApiLocationPostListCombo';
import { IApiNotificationAvailable } from '../interfaces/IApiNotificationAvailable';
import { IApiNotifications } from '../interfaces/IApiNotifications';
import { IApiPin } from '../interfaces/IApiPin';
import { IApiPostAdded } from '../interfaces/IApiPostAdded';
import { IApiPostDetails } from '../interfaces/IApiPostDetails';
import { IApiPostDetailsPost } from '../interfaces/IApiPostDetailsPost';
import { IApiPostListCombo } from '../interfaces/IApiPostListCombo';
import { IApiPostListSingle } from '../interfaces/IApiPostListSingle';
import { IApiRecommendedChannels } from '../interfaces/IApiRecommendedChannels';
import { IApiRefreshToken } from '../interfaces/IApiRefreshToken';
import { IApiRegister } from '../interfaces/IApiRegister';
import { IApiShare } from '../interfaces/IApiShare';
import { IApiVote } from '../interfaces/IApiVote';
import { IGeoCoordinates } from '../interfaces/ILocation';
import { IJodelAppStore } from '../redux/reducers';
import { accessTokenSelector, isRefreshingTokenSelector } from '../redux/selectors/app';
import Settings from './settings';

const API_PATH_V2 = '/v2';
const API_PATH_V3 = '/v3';

type HttpMethods = 'GET' | 'HEAD' | 'POST' | 'DELETE' | 'PUT';

export class JodelApi {
    private nextAccessToken: Promise<string> | undefined;

    public constructor(private store: Store<IJodelAppStore>) {
    }

    /**
     * Create a new android gcm account
     */
    public getGcmAndroidAccount(): Promise<IApiGcmAccount> {
        const headers = new Headers([
            ['Accept', 'application/json'],
        ]);
        return fetch(Settings.GCM_ACCOUNT_HELPER_URL,
            {
                headers,
                method: 'GET',
                mode: 'cors',
            })
            .then(res => res.json())
            .then(body => {
                if (body.error) {
                    return body.error;
                }
                return body;
            });
    }

    /**
     * Receive the gcm push verification sent by the jodel server via GCM
     */
    public receiveGcmPushVerification(androidAccount: IApiAndroidAccount): Promise<IApiGcmVerification> {
        const headers = new Headers([
            ['Accept', 'application/json'],
            ['Content-Type', 'application/json'],
        ]);
        return fetch(Settings.GCM_RECEIVE_HELPER_URL, {
            body: JSON.stringify(androidAccount),
            headers,
            method: 'POST',
            mode: 'cors',
        })
            .then(res => res.json());
    }

    // public apiGetPosts(callback) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/', {});
    // }

    public apiGetPostsCombo(latitude: number, longitude: number, stickies = true, home: boolean, skipHometown: boolean,
        channels: boolean): Promise<IApiLocationPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/location/combo', {
            channels,
            home,
            lat: latitude,
            lng: longitude,
            skipHometown,
            stickies,
        })
            .then(res => res.json());
    }

    public apiGetPosts(sortType: PostListSortType, afterPostId: string | undefined, latitude: number, longitude: number,
        home: boolean, channels: boolean, postType?: PostListPostType): Promise<IApiPostListSingle> {
        let apiSortType;
        switch (sortType) {
            case PostListSortType.RECENT:
                apiSortType = '';
                break;
            case PostListSortType.DISCUSSED:
                apiSortType = 'discussed';
                break;
            case PostListSortType.POPULAR:
                apiSortType = 'popular';
                break;
            default:
                throw new Error('Unknown sort type');
        }
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/location/' + apiSortType, {
            after: afterPostId,
            channels,
            home,
            lat: latitude,
            lng: longitude,
            type: postType,
        })
            .then(res => res.json());
    }

    public apiGetPostsMineCombo(): Promise<IApiPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/combo', {})
            .then(res => res.json());
    }

    public apiGetPostsMine(sortType: PostListSortType, skip?: number, limit?: number): Promise<IApiPostListSingle> {
        let type;
        switch (sortType) {
            case PostListSortType.RECENT:
                type = '';
                break;
            case PostListSortType.DISCUSSED:
                type = 'discussed';
                break;
            case PostListSortType.POPULAR:
                type = 'popular';
                break;
            default:
                throw new Error('Unknown sort type');
        }
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/' + type, {
            limit,
            skip,
        })
            .then(res => res.json());
    }

    public apiGetPostsMineReplies(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/replies', {
            limit,
            skip,
        })
            .then(res => res.json());
    }

    public apiGetPostsMinePinned(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/pinned', {
            limit,
            skip,
        })
            .then(res => res.json());
    }

    public apiGetPostsMineVotes(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/votes', {
            limit,
            skip,
        })
            .then(res => res.json());
    }

    public apiGetPostsChannelCombo(channel: string,
        home = false): Promise<IApiChannelPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/combo',
            { channel, home },
            {})
            .then(res => res.json());
    }

    public apiGetPostsChannel(sortType: PostListSortType, afterPostId: string | undefined,
        channel: string, home = false): Promise<IApiPostListSingle> {
        let type;
        switch (sortType) {
            case PostListSortType.RECENT:
                type = '';
                break;
            case PostListSortType.DISCUSSED:
                type = 'discussed';
                break;
            case PostListSortType.POPULAR:
                type = 'popular';
                break;
            default:
                throw new Error('Unknown sort type');
        }
        const query = {
            after: afterPostId,
            channel,
            home,
        };
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/' + type, query)
            .then(res => res.json());
    }

    public apiGetPostsHashtagCombo(hashtag: string,
        home = false): Promise<IApiHashtagPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/combo',
            { hashtag, home },
            {})
            .then(res => res.json());
    }

    public apiGetPostsHashtag(sortType: PostListSortType, afterPostId: string | undefined,
        hashtag: string, home = false): Promise<IApiPostListSingle> {
        let type;
        switch (sortType) {
            case PostListSortType.RECENT:
                type = '';
                break;
            case PostListSortType.DISCUSSED:
                type = 'discussed';
                break;
            case PostListSortType.POPULAR:
                type = 'popular';
                break;
            default:
                throw new Error('Unknown sort type');
        }
        const query = {
            after: afterPostId,
            hashtag,
            home,
        };
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/' + type, query)
            .then(res => res.json());
    }

    // public apiGetPost(postId: string) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {});
    // }

    public apiGetPostDetails(postId: string, details = true, nextReply: string | undefined,
        reversed = false, ojFilter = false, bookmark = false): Promise<IApiPostDetails> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/details', {
            bookmark,
            details,
            oj_filter: ojFilter,
            reply: nextReply,
            reversed,
        })
            .then(res => res.json());
    }

    public apiDeletePost(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('DELETE', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {}, {})
            .then(() => undefined);
    }

    public apiUpVote(postId: string): Promise<IApiVote> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/upvote', {},
            { reason_code: -1 })
            .then(res => res.json());
    }

    public apiDownVote(postId: string): Promise<IApiVote> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/downvote',
            {},
            { reason_code: -1 })
            .then(res => res.json());
    }

    public apiGiveThanks(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/giveThanks',
            {},
            {})
            .then(() => undefined);
    }

    public apiPin(postId: string): Promise<IApiPin> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/pin', {}, {})
            .then(res => res.json());
    }

    public apiUnpin(postId: string): Promise<IApiPin> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/unpin', {},
            {})
            .then(res => res.json());
    }

    public apiFollowChannel(channel: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/followChannel', { channel },
            {})
            .then(() => undefined);
    }

    public apiUnfollowChannel(channel: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/unfollowChannel', { channel },
            {})
            .then(() => undefined);
    }

    public apiGetRecommendedChannels(home = false): Promise<IApiRecommendedChannels> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/recommendedChannels', { home },
            {})
            .then(res => res.json());
    }

    public apiGetFollowedChannelsMeta(channels: { [channelName: string]: number },
        home = false): Promise<IApiChannelsMeta> {
        // Format: {"channelName": timestamp, "channel2": timestamp2}
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/user/followedChannelsMeta',
            { home },
            channels)
            .then(res => res.json());
    }

    public apiGetSuggestedHashtags(home = false) {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/hashtags/suggested', { home })
            .then(res => res.json());
    }

    // TODO https://jodel-app.com/legal/eula-pop/en/
    public apiAddPost(channel: string | undefined, ancestorPostId: string | undefined,
        color: Color | undefined, locAccuracy: number, latitude: number, longitude: number,
        city: string, country: string, message: string, image: string | undefined,
        toHome = false): Promise<IApiPostAdded> {
        // image must be base64 encoded string
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/', {}, {
            ancestor: ancestorPostId,
            channel,
            color,
            image,
            // has_drawing,
            // has_hashtag,
            location: {
                city,
                country,
                loc_accuracy: locAccuracy,
                loc_coordinates: { lat: latitude, lng: longitude },
                name: city,
            },
            // mention
            message,
            to_home: toHome,
        })
            .then(res => res.json());
    }

    public apiGetConfig(): Promise<IApiConfig> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/config', {})
            .then(res => res.json());
    }

    public apiGetKarma(): Promise<IApiKarma> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/users/karma', {})
            .then(res => res.json());
    }

    public apiSetLocation(latitude: number, longitude: number, city: string,
        country: string): Promise<void> {
        const data = {
            location: {
                city,
                country,
                loc_accuracy: 0.0,
                loc_coordinates: {
                    lat: latitude,
                    lng: longitude,
                },
                name: city,
            },
        };
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/users/location', {}, data)
            .then(() => undefined);
    }

    public apiSetHome(latitude: number, longitude: number, city: string,
        country: string): Promise<void> {
        const data = {
            location: {
                city,
                country,
                loc_accuracy: 0.0,
                loc_coordinates: {
                    lat: latitude,
                    lng: longitude,
                },
                name: city,
            },
        };
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/home', {}, data)
            .then(() => undefined);
    }

    public apiDeleteHome(): Promise<void> {
        return this.jodelRequestWithAuth('DELETE', Settings.API_SERVER + API_PATH_V3 + '/user/home', {}, {})
            .then(() => undefined);
    }

    public apiSetAction(action: ApiAction): Promise<void> {
        const data = {
            action,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/action', {}, data)
            .then(() => undefined);
    }

    /**
     * Send Gcm Push token to Jodel server, which will then send a verification code via GCM
     * @param {string} clientId Fixed Jodel android client id
     * @param {string} pushToken Gcm push token
     */
    public apiSetPushToken(clientId: string, pushToken: string): Promise<void> {
        const data = {
            client_id: clientId,
            push_token: pushToken,
        };
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/users/pushToken', {}, data)
            .then(() => undefined);
    }

    public apiVerifyPush(serverTime: number, verificationCode: string): Promise<void> {
        // Verify GCM push
        const data = {
            server_time: serverTime,
            verification_code: verificationCode,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/user/verification/push', {},
            data)
            .then(() => undefined);
    }

    public apiGetAccessToken(deviceUid: string, latitude = 0.0, longitude = 0.0, city: string,
        country: string): Promise<IApiRegister> {
        const data = {
            client_id: Settings.CLIENT_ID,
            device_uid: deviceUid,
            location: {
                city,
                country,
                loc_accuracy: 10.56,
                loc_coordinates: {
                    lat: latitude,
                    lng: longitude,
                },
            },
        };
        return this.jodelRequestWithoutAuth('POST', Settings.API_SERVER + API_PATH_V2 + '/users/', {}, data)
            .then(res => res.json());
    }

    public apiRefreshAccessToken(distinctId: string,
        refreshToken: string): Promise<IApiRefreshToken> {
        const data = {
            current_client_id: Settings.CLIENT_ID,
            distinct_id: distinctId,
            refresh_token: refreshToken,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V2 + '/users/refreshToken', {}, data)
            .then(res => res.json());
    }

    public apiIsNotificationAvailable(): Promise<IApiNotificationAvailable> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/new', {})
            .then(res => res.json());
    }

    public apiGetNotifications(): Promise<IApiNotifications> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications', {}, {})
            .then(res => res.json());
    }

    public apiSetNotificationPostRead(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/post/' +
            postId +
            '/read',
            {}, {})
            .then(() => undefined);
    }

    /**
     * Set the user's language on the server
     * @param language Language name in ISO 639-1 format, e.g. 'de-de'
     */
    public apiSetUserLanguage(language: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/language', {}, { language })
            .then(() => undefined);
    }

    /**
     * Set the user's profile on the server
     * @param {string} userType User profile type, e.g. student
     * @param {Number} [age] User's age
     * @returns {*}
     */
    public apiSetUserProfile(userType: UserType | null, age = 0): Promise<void> {
        const data = {
            age,
            user_type: userType,
        };
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/profile', {}, data)
            .then(() => undefined);
    }

    /**
     * Share a post, the server generates a url that can be shared.
     * @param {number} postId The postId you want to share
     * @returns {*} a server generated url
     */
    public apiSharePost(postId: string): Promise<IApiShare> {
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/share', {},
            {})
            .then(res => res.json());
    }

    public apiSearchPosts(message: string, suggested = false,
        home = false): Promise<Response> {
        const data = {
            message,
            suggested,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/search', { home }, data);
    }

    public apiStickyPostClose(stickyPostId: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/stickyposts/' + stickyPostId +
            '/up', {},
            {})
            .then(() => undefined);
    }

    public async apiEnableFeedInternationalization(): Promise<void> {
        await this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 +
            '/user/feedInternationalization/enable/', {}, {});
        return undefined;
    }

    public async apiGetPictureOfDay(): Promise<IApiPostDetailsPost> {
        const res = await this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 +
            '/posts/pictureOfDay', {});
        return res.json();
    }

    public async apiDisableFeedInternationalization(): Promise<void> {
        await this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 +
            '/user/feedInternationalization/disable/', {}, {});
        return undefined;
    }

    private getAuth(): Promise<string> {
        if (this.nextAccessToken) {
            return this.nextAccessToken;
        }

        const currentIsRefreshing = isRefreshingTokenSelector(this.store.getState());
        if (!currentIsRefreshing) {
            const currentAuth = accessTokenSelector(this.store.getState());
            if (currentAuth) {
                return Promise.resolve(currentAuth);
            }
        }

        return this.nextAccessToken = new Promise(resolve => {
            const unsubscribe = this.store.subscribe(() => {
                const isRefreshing = isRefreshingTokenSelector(this.store.getState());
                if (isRefreshing) {
                    return;
                }

                const auth = accessTokenSelector(this.store.getState());
                if (!auth) {
                    return;
                }
                unsubscribe();
                this.nextAccessToken = undefined;
                resolve(auth);
            });
        });
    }

    private parseUrl(url: string) {
        const parser = document.createElement('a');
        parser.href = url;
        return parser;
    }

    private computeSignature(auth: string | undefined, location: IGeoCoordinates | null, method: string, url: string, timestamp: string,
        query: { [key: string]: any }, data: string) {
        const u = this.parseUrl(url);
        let path = u.pathname;
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        const locationString = !location ? '' : `${location.latitude.toFixed(4)};${location.longitude.toFixed(4)}`;
        const queryPart = Object.keys(query)
            .filter(key => query[key] !== undefined)
            .map(key => encodeURIComponent(key) + '%' + encodeURIComponent(query[key]))
            .join('%');
        const raw = `${method}%${u.hostname}%${443}%${path}%${auth || ''}%${locationString}%${timestamp}%${queryPart}%${data}`;

        const hmac = createHmac('sha1', Settings.KEY);
        hmac.setEncoding('hex');
        hmac.write(raw);
        hmac.end();
        return hmac.read();
    }

    private async jodelRequestWithAuth(method: HttpMethods, url: string, query: { [key: string]: any },
        data?: object | string): Promise<Response> {
        const auth = await this.getAuth();
        return this.jodelRequest(auth, method, url, query, data);
    }

    private jodelRequestWithoutAuth(method: HttpMethods, url: string, query: { [key: string]: any },
        data?: object | string): Promise<Response> {
        return this.jodelRequest(undefined, method, url, query, data);
    }

    private jodelRequest(auth: string | undefined, method: HttpMethods, url: string, query: { [key: string]: any },
        data?: object | string): Promise<Response> {
        const dataString = method !== 'GET' && method !== 'HEAD' && data ? JSON.stringify(data) : undefined;
        const timestamp = new Date().toISOString();
        const sig = this.computeSignature(auth, null, method, url, timestamp, query, dataString || '');

        function toFormUrlencoded(form: { [key: string]: string }): string {
            return Object.keys(form)
                .filter(key => form[key] != null)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(form[key]))
                .join('&');
        }

        const queryString = toFormUrlencoded(query);
        if (queryString) {
            url += '?' + queryString;
        }

        const headers = new Headers([
            ['Accept', 'application/json'],
            ['X-Client-Type', Settings.CLIENT_TYPE],
            ['X-Api-Version', '0.2'],
            ['X-Timestamp', timestamp],
            ['X-Authorization', 'HMAC ' + sig.toString()],
            ['Content-Type', 'application/json; charset=UTF-8'],
        ]);

        if (auth) {
            headers.set('Authorization', 'Bearer ' + auth);
        }

        return fetch(url, {
            body: dataString,
            headers,
            method,
            mode: 'cors',
        })
            .then(res => {
                if (res.ok) {
                    return Promise.resolve(res);
                }
                return res.json()
                    .then(body => body.error)
                    .catch(() => res.text())
                    .catch(() => undefined)
                    .then(description => {
                        return Promise.reject({
                            message: res.statusText,
                            description,
                            status: res.status,
                        });
                    });
            });
    }
}
