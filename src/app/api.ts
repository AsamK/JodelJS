import type { Store } from 'redux';

import type { ApiAction } from '../enums/ApiAction';
import type { Color } from '../enums/Color';
import type { PostListPostType } from '../enums/PostListPostType';
import { PostListSortType } from '../enums/PostListSortType';
import type { UserType } from '../enums/UserType';
import type { IApiChannelPostListCombo } from '../interfaces/IApiChannelPostListCombo';
import type { IApiChannelsMeta } from '../interfaces/IApiChannelsMeta';
import type { IApiConfig } from '../interfaces/IApiConfig';
import type { IApiAndroidAccount, IApiGcmAccount } from '../interfaces/IApiGcmAccount';
import type { IApiGcmVerification } from '../interfaces/IApiGcmVerification';
import type { IApiHashtagPostListCombo } from '../interfaces/IApiHashtagPostListCombo';
import type { IApiKarma } from '../interfaces/IApiKarma';
import type { IApiLocationPostListCombo } from '../interfaces/IApiLocationPostListCombo';
import type { IApiNotificationAvailable } from '../interfaces/IApiNotificationAvailable';
import type { IApiNotifications } from '../interfaces/IApiNotifications';
import type { IApiPin } from '../interfaces/IApiPin';
import type { IApiPollVotes } from '../interfaces/IApiPollVotes';
import type { IApiPostAdded } from '../interfaces/IApiPostAdded';
import type { IApiPostDetails } from '../interfaces/IApiPostDetails';
import type { IApiPostDetailsPost } from '../interfaces/IApiPostDetailsPost';
import type { IApiPostListCombo } from '../interfaces/IApiPostListCombo';
import type { IApiPostListSingle } from '../interfaces/IApiPostListSingle';
import type { IApiRecommendedChannels } from '../interfaces/IApiRecommendedChannels';
import type { IApiRefreshToken } from '../interfaces/IApiRefreshToken';
import type { IApiRegister } from '../interfaces/IApiRegister';
import type { IApiShare } from '../interfaces/IApiShare';
import type { IApiVote } from '../interfaces/IApiVote';
import type { IGeoCoordinates } from '../interfaces/ILocation';
import type { IJodelAppStore } from '../redux/reducers';
import { accessTokenSelector, isRefreshingTokenSelector } from '../redux/selectors/app';
import { toHex } from '../utils/bytes.utils';

import Settings from './settings';

const API_PATH_V2 = '/v2';
const API_PATH_V3 = '/v3';

type HttpMethods = 'GET' | 'HEAD' | 'POST' | 'DELETE' | 'PUT';

export class JodelApi {
    private nextAccessToken: Promise<string> | undefined;

    public constructor(private store: Store<IJodelAppStore>) {}

    /**
     * Create a new android gcm account
     */
    public async getGcmAndroidAccount(): Promise<IApiGcmAccount> {
        const headers = new Headers([['Accept', 'application/json']]);
        const res = await fetch(Settings.GCM_ACCOUNT_HELPER_URL, {
            headers,
            method: 'GET',
            mode: 'cors',
        });
        const body = (await res.json()) as IApiGcmAccount | { error: IApiGcmAccount };
        if ('error' in body) {
            return body.error;
        }
        return body;
    }

    /**
     * Receive the gcm push verification sent by the jodel server via GCM
     */
    public async receiveGcmPushVerification(
        androidAccount: IApiAndroidAccount,
    ): Promise<IApiGcmVerification> {
        const headers = new Headers([
            ['Accept', 'application/json'],
            ['Content-Type', 'application/json'],
        ]);
        const res = await fetch(Settings.GCM_RECEIVE_HELPER_URL, {
            body: JSON.stringify(androidAccount),
            headers,
            method: 'POST',
            mode: 'cors',
        });
        return (await res.json()) as IApiGcmVerification;
    }

    // public apiGetPosts(callback) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/', {});
    // }

    public async apiGetPostsCombo(
        latitude: number,
        longitude: number,
        stickies = true,
        home: boolean,
        skipHometown: boolean,
        channels: boolean,
    ): Promise<IApiLocationPostListCombo> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/location/combo',
            {
                channels,
                home,
                lat: latitude,
                lng: longitude,
                skipHometown,
                stickies,
            },
        );
        return (await res.json()) as IApiLocationPostListCombo;
    }

    public async apiGetPosts(
        sortType: PostListSortType,
        afterPostId: string | undefined,
        latitude: number,
        longitude: number,
        home: boolean,
        channels: boolean,
        postType?: PostListPostType,
    ): Promise<IApiPostListSingle> {
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
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/location/' + apiSortType,
            {
                after: afterPostId,
                channels,
                home,
                lat: latitude,
                lng: longitude,
                type: postType,
            },
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsMineCombo(): Promise<IApiPostListCombo> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/mine/combo',
            {},
        );
        return (await res.json()) as IApiPostListCombo;
    }

    public async apiGetPostsMine(
        sortType: PostListSortType,
        skip?: number,
        limit?: number,
    ): Promise<IApiPostListSingle> {
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
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/mine/' + type,
            {
                limit,
                skip,
            },
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsMineReplies(
        skip?: number,
        limit?: number,
    ): Promise<IApiPostListSingle> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/mine/replies',
            {
                limit,
                skip,
            },
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsMinePinned(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/mine/pinned',
            {
                limit,
                skip,
            },
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsMineVotes(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/posts/mine/votes',
            {
                limit,
                skip,
            },
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsChannelCombo(
        channel: string,
        home = false,
    ): Promise<IApiChannelPostListCombo> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/channel/combo',
            { channel, home },
            {},
        );
        return (await res.json()) as IApiChannelPostListCombo;
    }

    public async apiGetPostsChannel(
        sortType: PostListSortType,
        afterPostId: string | undefined,
        channel: string,
        home = false,
    ): Promise<IApiPostListSingle> {
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
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/channel/' + type,
            query,
        );
        return (await res.json()) as IApiPostListSingle;
    }

    public async apiGetPostsHashtagCombo(
        hashtag: string,
        home = false,
    ): Promise<IApiHashtagPostListCombo> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/combo',
            { hashtag, home },
            {},
        );
        return (await res.json()) as IApiHashtagPostListCombo;
    }

    public async apiGetPostsHashtag(
        sortType: PostListSortType,
        afterPostId: string | undefined,
        hashtag: string,
        home = false,
    ): Promise<IApiPostListSingle> {
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
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/' + type,
            query,
        );
        return (await res.json()) as IApiPostListSingle;
    }

    // public apiGetPost(postId: string) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {});
    // }

    public async apiGetPostDetails(
        postId: string,
        details = true,
        nextReply: string | undefined,
        reversed = false,
        ojFilter = false,
        bookmark = false,
    ): Promise<IApiPostDetails> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/details',
            {
                bookmark,
                details,
                oj_filter: ojFilter,
                reply: nextReply,
                reversed,
            },
        );
        return (await res.json()) as IApiPostDetails;
    }

    public async apiDeletePost(postId: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'DELETE',
            Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId,
            {},
            {},
        );
    }

    public async apiUpVote(postId: string): Promise<IApiVote> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/upvote',
            {},
            { reason_code: -1 },
        );
        return (await res.json()) as IApiVote;
    }

    public async apiDownVote(postId: string): Promise<IApiVote> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/downvote',
            {},
            { reason_code: -1 },
        );
        return (await res.json()) as IApiVote;
    }

    public async apiPollVote(pollId: string, option: number): Promise<IApiPollVotes> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/polls/' + pollId + '/vote',
            {},
            { option },
        );
        return (await res.json()) as IApiPollVotes;
    }

    public async apiGiveThanks(postId: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/giveThanks',
            {},
            {},
        );
    }

    public async apiPin(postId: string): Promise<IApiPin> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/pin',
            {},
            {},
        );
        return (await res.json()) as IApiPin;
    }

    public async apiUnpin(postId: string): Promise<IApiPin> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/unpin',
            {},
            {},
        );
        return (await res.json()) as IApiPin;
    }

    public async apiFollowChannel(channel: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/followChannel',
            { channel },
            {},
        );
    }

    public async apiUnfollowChannel(channel: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/unfollowChannel',
            { channel },
            {},
        );
    }

    public async apiGetRecommendedChannels(home = false): Promise<IApiRecommendedChannels> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/user/recommendedChannels',
            { home },
            {},
        );
        return (await res.json()) as IApiRecommendedChannels;
    }

    public async apiGetFollowedChannelsMeta(
        channels: { [channelName: string]: number },
        home = false,
    ): Promise<IApiChannelsMeta> {
        // Format: {"channelName": timestamp, "channel2": timestamp2}
        const res = await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/user/followedChannelsMeta',
            { home },
            channels,
        );
        return (await res.json()) as IApiChannelsMeta;
    }

    public async apiGetSuggestedHashtags(home = false): Promise<{ hashtags: string[] }> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/hashtags/suggested',
            { home },
        );
        return (await res.json()) as { hashtags: string[] };
    }

    // TODO https://jodel-app.com/legal/eula-pop/en/
    public async apiAddPost(
        channel: string | undefined,
        ancestorPostId: string | undefined,
        color: Color | undefined,
        locAccuracy: number,
        latitude: number,
        longitude: number,
        city: string,
        country: string,
        message: string,
        image: string | undefined,
        toHome = false,
    ): Promise<IApiPostAdded> {
        // image must be base64 encoded string
        const res = await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/posts/',
            {},
            {
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
            },
        );
        return (await res.json()) as IApiPostAdded;
    }

    public async apiGetConfig(): Promise<IApiConfig> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/user/config',
            {},
        );
        return (await res.json()) as IApiConfig;
    }

    public async apiGetKarma(): Promise<IApiKarma> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V2 + '/users/karma',
            {},
        );
        return (await res.json()) as IApiKarma;
    }

    public async apiSetLocation(
        latitude: number,
        longitude: number,
        city: string,
        country: string,
    ): Promise<void> {
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
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/users/location',
            {},
            data,
        );
    }

    public async apiSetHome(
        latitude: number,
        longitude: number,
        city: string,
        country: string,
    ): Promise<void> {
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
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/home',
            {},
            data,
        );
    }

    public async apiDeleteHome(): Promise<void> {
        await this.jodelRequestWithAuth(
            'DELETE',
            Settings.API_SERVER + API_PATH_V3 + '/user/home',
            {},
            {},
        );
    }

    public async apiSetAction(action: ApiAction): Promise<void> {
        const data = {
            action,
        };
        await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/action',
            {},
            data,
        );
    }

    /**
     * Send Gcm Push token to Jodel server, which will then send a verification code via GCM
     *
     * @param {string} clientId Fixed Jodel android client id
     * @param {string} pushToken Gcm push token
     */
    public async apiSetPushToken(clientId: string, pushToken: string): Promise<void> {
        const data = {
            client_id: clientId,
            push_token: pushToken,
        };
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V2 + '/users/pushToken',
            {},
            data,
        );
    }

    public async apiVerifyPush(serverTime: number, verificationCode: string): Promise<void> {
        // Verify GCM push
        const data = {
            server_time: serverTime,
            verification_code: verificationCode,
        };
        await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/user/verification/push',
            {},
            data,
        );
    }

    public async apiGetAccessToken(
        deviceUid: string,
        latitude = 0.0,
        longitude = 0.0,
        city: string,
        country: string,
    ): Promise<IApiRegister> {
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
        const res = await this.jodelRequestWithoutAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V2 + '/users/',
            {},
            data,
        );
        return (await res.json()) as IApiRegister;
    }

    public async apiRefreshAccessToken(
        distinctId: string,
        refreshToken: string,
    ): Promise<IApiRefreshToken> {
        const data = {
            current_client_id: Settings.CLIENT_ID,
            distinct_id: distinctId,
            refresh_token: refreshToken,
        };
        const res = await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V2 + '/users/refreshToken',
            {},
            data,
        );
        return (await res.json()) as IApiRefreshToken;
    }

    public async apiIsNotificationAvailable(): Promise<IApiNotificationAvailable> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/user/notifications/new',
            {},
        );
        return (await res.json()) as IApiNotificationAvailable;
    }

    public async apiGetNotifications(): Promise<IApiNotifications> {
        const res = await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/notifications',
            {},
            {},
        );
        return (await res.json()) as IApiNotifications;
    }

    public async apiSetNotificationPostRead(postId: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/notifications/post/' + postId + '/read',
            {},
            {},
        );
    }

    /**
     * Set the user's language on the server
     *
     * @param language Language name in ISO 639-1 format, e.g. 'de-de'
     */
    public async apiSetUserLanguage(language: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/language',
            {},
            { language },
        );
    }

    /**
     * Set the user's profile on the server
     *
     * @param {string} userType User profile type, e.g. student
     * @param {Number} [age] User's age
     * @returns {*}
     */
    public async apiSetUserProfile(userType: UserType | null, age = 0): Promise<void> {
        const data = {
            age,
            user_type: userType,
        };
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/profile',
            {},
            data,
        );
    }

    /**
     * Share a post, the server generates a url that can be shared.
     *
     * @param {number} postId The postId you want to share
     * @returns {*} a server generated url
     */
    public async apiSharePost(postId: string): Promise<IApiShare> {
        const res = await this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/share',
            {},
            {},
        );
        return (await res.json()) as IApiShare;
    }

    public apiSearchPosts(message: string, suggested = false, home = false): Promise<Response> {
        const data = {
            message,
            suggested,
        };
        return this.jodelRequestWithAuth(
            'POST',
            Settings.API_SERVER + API_PATH_V3 + '/posts/search',
            { home },
            data,
        );
    }

    public async apiStickyPostClose(stickyPostId: string): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/stickyposts/' + stickyPostId + '/up',
            {},
            {},
        );
    }

    public async apiEnableFeedInternationalization(): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/feedInternationalization/enable/',
            {},
            {},
        );
    }

    public async apiGetPictureOfDay(): Promise<IApiPostDetailsPost> {
        const res = await this.jodelRequestWithAuth(
            'GET',
            Settings.API_SERVER + API_PATH_V3 + '/posts/pictureOfDay',
            {},
        );
        return (await res.json()) as IApiPostDetailsPost;
    }

    public async apiDisableFeedInternationalization(): Promise<void> {
        await this.jodelRequestWithAuth(
            'PUT',
            Settings.API_SERVER + API_PATH_V3 + '/user/feedInternationalization/disable/',
            {},
            {},
        );
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

        return (this.nextAccessToken = new Promise(resolve => {
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
        }));
    }

    private parseUrl(url: string): HTMLAnchorElement {
        const parser = document.createElement('a');
        parser.href = url;
        return parser;
    }

    private computeSignature(
        auth: string | undefined,
        location: string,
        method: string,
        url: string,
        timestamp: string,
        query: { [key: string]: string | number | boolean | undefined },
        data: string,
    ): Promise<string> {
        const u = this.parseUrl(url);
        let path = u.pathname;
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        const queryPart = Object.keys(query)
            .filter(key => query[key] !== undefined)
            .map(key => encodeURIComponent(key) + '%' + encodeURIComponent(query[key]!))
            .join('%');
        const raw = `${method}%${u.hostname}%${443}%${path}%${
            auth || ''
        }%${location}%${timestamp}%${queryPart}%${data}`;

        return this.computeSha1Hex(raw);
    }

    private async computeSha1Hex(message: string): Promise<string> {
        const enc = new TextEncoder();
        const encodedMessage = enc.encode(message);
        const encodedKey = enc.encode(Settings.KEY);
        const key = await crypto.subtle.importKey(
            'raw',
            encodedKey,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign'],
        );
        const signature = await crypto.subtle.sign('HMAC', key, encodedMessage);
        return toHex(signature);
    }

    private async jodelRequestWithAuth(
        method: HttpMethods,
        url: string,
        query: { [key: string]: string | number | boolean | undefined },
        data?: object | string,
    ): Promise<Response> {
        const auth = await this.getAuth();
        return this.jodelRequest(auth, null, method, url, query, data);
    }

    private jodelRequestWithoutAuth(
        method: HttpMethods,
        url: string,
        query: { [key: string]: string | number | boolean | undefined },
        data?: object | string,
    ): Promise<Response> {
        return this.jodelRequest(undefined, null, method, url, query, data);
    }

    private async jodelRequest(
        auth: string | undefined,
        location: IGeoCoordinates | null,
        method: HttpMethods,
        url: string,
        query: { [key: string]: string | number | boolean | undefined },
        data?: object | string,
    ): Promise<Response> {
        const dataString =
            method !== 'GET' && method !== 'HEAD' && data ? JSON.stringify(data) : undefined;
        const timestamp = new Date().toISOString();
        const locationString = !location
            ? ''
            : `${location.latitude.toFixed(4)};${location.longitude.toFixed(4)}`;
        const sig = await this.computeSignature(
            auth,
            locationString,
            method,
            url,
            timestamp,
            query,
            dataString || '',
        );

        function toFormUrlencoded(form: {
            [key: string]: string | number | boolean | undefined;
        }): string {
            return Object.keys(form)
                .filter(key => form[key] != null)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(form[key]!))
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
            ['X-Authorization', 'HMAC ' + sig],
            ['Content-Type', 'application/json; charset=UTF-8'],
        ]);

        if (auth) {
            headers.set('Authorization', 'Bearer ' + auth);
        }

        if (locationString) {
            headers.set('X-Location', locationString);
        }

        const res = await fetch(url, {
            body: dataString,
            headers,
            method,
            mode: 'cors',
        });

        if (res.ok) {
            return res;
        }

        let description: string | undefined;
        try {
            description = ((await res.json()) as { error?: string }).error;
        } catch (e) {
            try {
                description = await res.text();
            } catch (_) {
                description = undefined;
            }
        }

        // eslint-disable-next-line no-throw-literal
        throw {
            description,
            message: res.statusText,
            status: res.status,
        };
    }
}
