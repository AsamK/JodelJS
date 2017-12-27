import * as createHmac from 'create-hmac';
import {Store} from 'redux';
import * as request from 'superagent';

import Settings from '../app/settings';
import {ApiAction} from '../enums/ApiAction';
import {Color} from '../enums/Color';
import {PostListSortType} from '../enums/PostListSortType';
import {UserType} from '../enums/UserType';
import {IApiChannelPostListCombo} from '../interfaces/IApiChannelPostListCombo';
import {IApiChannelsMeta} from '../interfaces/IApiChannelsMeta';
import {IApiConfig} from '../interfaces/IApiConfig';
import {IApiAndroidAccount, IApiGcmAccount} from '../interfaces/IApiGcmAccount';
import {IApiGcmVerification} from '../interfaces/IApiGcmVerification';
import {IApiHashtagPostListCombo} from '../interfaces/IApiHashtagPostListCombo';
import {IApiImageCaptcha} from '../interfaces/IApiImageCaptcha';
import {IApiKarma} from '../interfaces/IApiKarma';
import {IApiLocationPostListCombo} from '../interfaces/IApiLocationPostListCombo';
import {IApiNotificationAvailable} from '../interfaces/IApiNotificationAvailable';
import {IApiNotifications} from '../interfaces/IApiNotifications';
import {IApiPin} from '../interfaces/IApiPin';
import {IApiPostAdded} from '../interfaces/IApiPostAdded';
import {IApiPostDetails} from '../interfaces/IApiPostDetails';
import {IApiPostDetailsPost} from '../interfaces/IApiPostDetailsPost';
import {IApiPostListCombo} from '../interfaces/IApiPostListCombo';
import {IApiPostListSingle} from '../interfaces/IApiPostListSingle';
import {IApiRecommendedChannels} from '../interfaces/IApiRecommendedChannels';
import {IApiRefreshToken} from '../interfaces/IApiRefreshToken';
import {IApiRegister} from '../interfaces/IApiRegister';
import {IApiShare} from '../interfaces/IApiShare';
import {IApiVerify} from '../interfaces/IApiVerify';
import {IApiVote} from '../interfaces/IApiVote';
import {IJodelAppStore} from '../redux/reducers';
import {getAccessToken, getIsRefreshingToken} from '../redux/selectors/app';

const API_PATH_V2 = '/v2';
const API_PATH_V3 = '/v3';

export class JodelApi {
    private nextAccessToken: Promise<string> | undefined;

    public constructor(private store: Store<IJodelAppStore>) {
    }

    /**
     * Create a new android gcm account
     */
    public getGcmAndroidAccount(): Promise<IApiGcmAccount> {
        return request('GET', Settings.GCM_ACCOUNT_HELPER_URL)
            .set('Accept', 'application/json')
            .send()
            .then(res => {
                if (res.body.error) {
                    return res.body.error;
                }
                return res.body;
            });
    }

    /**
     * Receive the gcm push verification sent by the jodel server via GCM
     */
    public receiveGcmPushVerification(androidAccount: IApiAndroidAccount): Promise<IApiGcmVerification> {
        return request('POST', Settings.GCM_RECEIVE_HELPER_URL)
            .type('json')
            .set('Content-Type', 'application/json; charset=UTF-8')
            .send(JSON.stringify(androidAccount))
            .then(res => res.body);
    }

    // public apiGetPosts(callback) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/', {}, {});
    // }

    public apiGetPostsCombo(latitude: number, longitude: number, stickies = true,
                            home = false): Promise<IApiLocationPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/location/combo', {
                home,
                lat: latitude,
                lng: longitude,
                stickies,
            }, {})
            .then(res => res.body);
    }

    public apiGetPosts(sortType: PostListSortType, afterPostId: string | undefined, latitude: number,
                       longitude: number, home = false): Promise<IApiPostListSingle> {
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
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/location/' + type, {
                after: afterPostId,
                home,
                lat: latitude,
                lng: longitude,
            }, {})
            .then(res => res.body);
    }

    public apiGetPostsMineCombo(): Promise<IApiPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/combo', {}, {})
            .then(res => res.body);
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
            }, {})
            .then(res => res.body);
    }

    public apiGetPostsMineReplies(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/replies', {
                limit,
                skip,
            }, {})
            .then(res => res.body);
    }

    public apiGetPostsMinePinned(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/pinned', {
                limit,
                skip,
            }, {})
            .then(res => res.body);
    }

    public apiGetPostsMineVotes(skip?: number, limit?: number): Promise<IApiPostListSingle> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/votes', {
                limit,
                skip,
            }, {})
            .then(res => res.body);
    }

    public apiGetPostsChannelCombo(channel: string,
                                   home = false): Promise<IApiChannelPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/combo',
            {channel, home},
            {})
            .then(res => res.body);
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
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/' + type, query, {})
            .then(res => res.body);
    }

    public apiGetPostsHashtagCombo(hashtag: string,
                                   home = false): Promise<IApiHashtagPostListCombo> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/combo',
            {hashtag, home},
            {})
            .then(res => res.body);
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
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/' + type, query, {})
            .then(res => res.body);
    }

    // public apiGetPost(postId: string) {
    //     return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {}, {});
    // }

    public apiGetPostDetails(postId: string, details = true, nextReply: string | undefined,
                             reversed = false, ojFilter = false, bookmark = false): Promise<IApiPostDetails> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/details', {
                bookmark,
                details,
                oj_filter: ojFilter,
                reply: nextReply,
                reversed,
            }, {})
            .then(res => res.body);
    }

    public apiDeletePost(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('DELETE', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {}, {})
            .then(res => res.body);
    }

    public apiUpVote(postId: string): Promise<IApiVote> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/upvote', {},
            {reason_code: -1})
            .then(res => res.body);
    }

    public apiDownVote(postId: string): Promise<IApiVote> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/downvote',
            {},
            {reason_code: -1})
            .then(res => res.body);
    }

    public apiGiveThanks(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/giveThanks',
            {},
            {})
            .then(res => res.body);
    }

    public apiPin(postId: string): Promise<IApiPin> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/pin', {}, {})
            .then(res => res.body);
    }

    public apiUnpin(postId: string): Promise<IApiPin> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/unpin', {},
            {})
            .then(res => res.body);
    }

    public apiFollowChannel(channel: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/followChannel', {channel},
            {})
            .then(res => res.body);
    }

    public apiUnfollowChannel(channel: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/unfollowChannel', {channel},
            {})
            .then(res => res.body);
    }

    public apiGetRecommendedChannels(home = false): Promise<IApiRecommendedChannels> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/recommendedChannels', {home},
            {})
            .then(res => res.body);
    }

    public apiGetFollowedChannelsMeta(channels: { [channelName: string]: number },
                                      home = false): Promise<IApiChannelsMeta> {
        // Format: {"channelName": timestamp, "channel2": timestamp2}
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/user/followedChannelsMeta',
            {home},
            channels)
            .then(res => res.body);
    }

    public apiGetSuggestedHashtags(home = false) {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/hashtags/suggested', {home}, {});
    }

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
                    loc_coordinates: {lat: latitude, lng: longitude},
                    name: city,
                },
                // mention
                message,
                to_home: toHome,
            })
            .then(res => res.body);
    }

    public apiGetConfig(): Promise<IApiConfig> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/config', {}, {})
            .then(res => res.body);
    }

    public apiGetKarma(): Promise<IApiKarma> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V2 + '/users/karma', {}, {})
            .then(res => res.body);
    }

    /**
     * Request a link to the verification image captcha
     * expected data from server: {key: String, image_url: String, image_size: Number}
     * @returns {Promise}
     */
    public apiGetImageCaptcha(): Promise<IApiImageCaptcha> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/verification/imageCaptcha',
            {}, {})
            .then(res => res.body);
    }

    /**
     * Send the user's answer back to the server
     * expected data from server: {verified: Boolean}
     * @returns {Promise}
     */
    public apiSendVerificationAnswer(key: string, answer: number[]): Promise<IApiVerify> {
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/user/verification/imageCaptcha',
            {}, {
                answer,
                key,
            })
            .then(res => res.body);
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
            .then(res => res.body);
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
            .then(res => res.body);
    }

    public apiDeleteHome(): Promise<void> {
        return this.jodelRequestWithAuth('DELETE', Settings.API_SERVER + API_PATH_V3 + '/user/home', {}, {})
            .then(res => res.body);
    }

    public apiSetAction(action: ApiAction): Promise<void> {
        const data = {
            action,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/action', {}, data)
            .then(res => res.body);
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
            .then(res => res.body);
    }

    public apiVerifyPush(serverTime: number, verificationCode: string): Promise<void> {
        // Verify GCM push
        const data = {
            server_time: serverTime,
            verification_code: verificationCode,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/user/verification/push', {},
            data)
            .then(res => res.body);
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
            .then(res => res.body);
    }

    public apiRefreshAccessToken(distinctId: string,
                                 refreshToken: string): Promise<IApiRefreshToken> {
        const data = {
            current_client_id: Settings.CLIENT_ID,
            distinct_id: distinctId,
            refresh_token: refreshToken,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V2 + '/users/refreshToken', {}, data)
            .then(res => res.body);
    }

    public apiIsNotificationAvailable(): Promise<IApiNotificationAvailable> {
        return this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/new', {}, {})
            .then(res => res.body);
    }

    public apiGetNotifications(): Promise<IApiNotifications> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications', {}, {})
            .then(res => res.body);
    }

    public apiSetNotificationPostRead(postId: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/post/' +
            postId +
            '/read',
            {}, {})
            .then(res => res.body);
    }

    /**
     * Set the user's language on the server
     * @param language Language name in ISO 639-1 format, e.g. 'de-de'
     */
    public apiSetUserLanguage(language: string) {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/language', {}, {language});
    }

    /**
     * Set the user's profile on the server
     * @param {string} userType User profile type, e.g. student
     * @param {Number} [age] User's age
     * @returns {*}
     */
    public apiSetUserProfile(userType: UserType, age = 0) {
        const data = {
            age,
            user_type: userType,
        };
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/user/profile', {}, data);
    }

    /**
     * Share a post, the server generates a url that can be shared.
     * @param {number} postId The postId you want to share
     * @returns {*} a server generated url
     */
    public apiSharePost(postId: string): Promise<IApiShare> {
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/share', {},
            {})
            .then(res => res.body);
    }

    public apiSearchPosts(message: string, suggested = false,
                          home = false): Promise<request.Response> {
        const data = {
            message,
            suggested,
        };
        return this.jodelRequestWithAuth('POST', Settings.API_SERVER + API_PATH_V3 + '/posts/search', {home}, data);
    }

    public apiStickyPostClose(stickyPostId: string): Promise<void> {
        return this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 + '/stickyposts/' + stickyPostId +
            '/up', {},
            {})
            .then(res => res.body);
    }

    public async apiEnableFeedInternationalization(): Promise<void> {
        const res = await this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 +
            '/user/feedInternationalization/enable/', {}, {});
        return res.body;
    }

    public async apiGetPictureOfDay(): Promise<IApiPostDetailsPost> {
        const res = await this.jodelRequestWithAuth('GET', Settings.API_SERVER + API_PATH_V3 +
            '/posts/pictureOfDay', {});
        return res.body;
    }

    public async apiDisableFeedInternationalization(): Promise<void> {
        const res = await this.jodelRequestWithAuth('PUT', Settings.API_SERVER + API_PATH_V3 +
            '/user/feedInternationalization/disable/', {}, {});
        return res.body;
    }

    private getAuth(): Promise<string> {
        if (this.nextAccessToken) {
            return this.nextAccessToken;
        }

        const currentIsRefreshing = getIsRefreshingToken(this.store.getState());
        if (!currentIsRefreshing) {
            const currentAuth = getAccessToken(this.store.getState());
            if (currentAuth) {
                return Promise.resolve(currentAuth);
            }
        }

        return this.nextAccessToken = new Promise(resolve => {
            const unsubscribe = this.store.subscribe(() => {
                const isRefreshing = getIsRefreshingToken(this.store.getState());
                if (isRefreshing) {
                    return;
                }

                const auth = getAccessToken(this.store.getState());
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

    private computeSignature(auth: string | undefined, method: string, url: string, timestamp: string, data: string) {
        const u = this.parseUrl(url);
        let path = u.pathname;
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        const raw = `${method}%${u.hostname}%${443}%${path}%${auth || ''}%${timestamp}%%${data}`;

        const hmac = createHmac('sha1', Settings.KEY);
        hmac.setEncoding('hex');
        hmac.write(raw);
        hmac.end();
        return hmac.read();
    }

    private async jodelRequestWithAuth(method: string, url: string, query: object | string,
                                       data?: object | string): Promise<request.Response> {
        const auth = await this.getAuth();
        return this.jodelRequest(auth, method, url, query, data);
    }

    private jodelRequestWithoutAuth(method: string, url: string, query: object | string,
                                    data?: object | string): Promise<request.Response> {
        return this.jodelRequest(undefined, method, url, query, data);
    }

    private jodelRequest(auth: string | undefined, method: string, url: string, query: object | string,
                         data?: object | string): Promise<request.Response> {
        const dataString = data ? JSON.stringify(data) : '';
        const timestamp = new Date().toISOString();
        const sig = this.computeSignature(auth, method, url, timestamp, dataString);

        const req = request(method, url)
            .query(query)
            .type('json')
            .set('Accept', 'application/json')
            .set('X-Client-Type', Settings.CLIENT_TYPE)
            .set('X-Api-Version', '0.2')
            .set('X-Timestamp', timestamp)
            .set('X-Authorization', 'HMAC ' + sig.toString())
            .set('Content-Type', 'application/json; charset=UTF-8');

        if (auth) {
            req.set('Authorization', 'Bearer ' + auth);
        }

        return req.send(dataString)
            .then();
    }
}
