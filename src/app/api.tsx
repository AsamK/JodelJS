import * as createHmac from 'create-hmac';
import * as request from 'superagent';

import Settings from '../app/settings';
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
import {IApiPostListCombo} from '../interfaces/IApiPostListCombo';
import {IApiPostListSingle} from '../interfaces/IApiPostListSingle';
import {IApiRecommendedChannels} from '../interfaces/IApiRecommendedChannels';
import {IApiRefreshToken} from '../interfaces/IApiRefreshToken';
import {IApiRegister} from '../interfaces/IApiRegister';
import {IApiShare} from '../interfaces/IApiShare';
import {IApiVerify} from '../interfaces/IApiVerify';
import {IApiVote} from '../interfaces/IApiVote';

const API_PATH_V2 = '/v2';
const API_PATH_V3 = '/v3';

function parseUrl(url: string) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser;
}

function computeSignature(auth: string | undefined, method: string, url: string, timestamp: string, data: string) {
    const u = parseUrl(url);
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

/**
 * Create a new android gcm account
 * @returns {Promise<request.Response>}
 */
export function getGcmAndroidAccount(): Promise<IApiGcmAccount> {
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
export function receiveGcmPushVerification(androidAccount: IApiAndroidAccount): Promise<IApiGcmVerification> {
    return request('POST', Settings.GCM_RECEIVE_HELPER_URL)
        .type('json')
        .set('Content-Type', 'application/json; charset=UTF-8')
        .send(JSON.stringify(androidAccount))
        .then(res => res.body);
}

export function jodelRequest(auth: string | undefined, method: string, url: string, query: object | string,
                             data: any): Promise<request.Response> {
    const dataString = JSON.stringify(data);
    const timestamp = new Date().toISOString();
    const sig = computeSignature(auth, method, url, timestamp, dataString);

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

// export function apiGetPosts(callback) {
//     return jodelRequest('GET', Settings.API_SERVER + API_PATH_V2 + '/posts/', {}, {});
// }

export function apiGetPostsCombo(auth: string, latitude: number, longitude: number, stickies = true,
                                 home = false): Promise<IApiLocationPostListCombo> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/location/combo', {
        home,
        lat: latitude,
        lng: longitude,
        stickies,
    }, {})
        .then(res => res.body);
}

export function apiGetPosts(auth: string, sortType: PostListSortType, afterPostId: string | undefined, latitude: number,
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
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/location/' + type, {
        after: afterPostId,
        home,
        lat: latitude,
        lng: longitude,
    }, {})
        .then(res => res.body);
}

export function apiGetPostsMineCombo(auth: string): Promise<IApiPostListCombo> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/combo', {}, {})
        .then(res => res.body);
}

export function apiGetPostsMine(auth: string, sortType: PostListSortType, skip?: number,
                                limit?: number): Promise<IApiPostListSingle> {
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
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/' + type, {
        limit,
        skip,
    }, {})
        .then(res => res.body);
}

export function apiGetPostsMineReplies(auth: string, skip?: number, limit?: number): Promise<IApiPostListSingle> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/replies', {
        limit,
        skip,
    }, {})
        .then(res => res.body);
}

export function apiGetPostsMinePinned(auth: string, skip?: number, limit?: number): Promise<IApiPostListSingle> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/pinned', {
        limit,
        skip,
    }, {})
        .then(res => res.body);
}

export function apiGetPostsMineVotes(auth: string, skip?: number, limit?: number): Promise<IApiPostListSingle> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/mine/votes', {
        limit,
        skip,
    }, {})
        .then(res => res.body);
}

export function apiGetPostsChannelCombo(auth: string, channel: string,
                                        home = false): Promise<IApiChannelPostListCombo> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/combo', {channel, home}, {})
        .then(res => res.body);
}

export function apiGetPostsChannel(auth: string, sortType: PostListSortType, afterPostId: string | undefined,
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
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/channel/' + type, query, {})
        .then(res => res.body);
}

export function apiGetPostsHashtagCombo(auth: string, hashtag: string,
                                        home = false): Promise<IApiHashtagPostListCombo> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/combo', {hashtag, home}, {})
        .then(res => res.body);
}

export function apiGetPostsHashtag(auth: string, sortType: PostListSortType, afterPostId: string | undefined,
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
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/hashtag/' + type, query, {})
        .then(res => res.body);
}

// export function apiGetPost(auth: string, postId: string) {
//     return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {}, {});
// }

export function apiGetPostDetails(auth: string, postId: string, details = true, nextReply: string | undefined,
                                  reversed = false, ojFilter = false, bookmark = false): Promise<IApiPostDetails> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/details', {
        bookmark,
        details,
        oj_filter: ojFilter,
        reply: nextReply,
        reversed,
    }, {})
        .then(res => res.body);
}

export function apiDeletePost(auth: string, postId: string): Promise<void> {
    return jodelRequest(auth, 'DELETE', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId, {}, {})
        .then(res => res.body);
}

export function apiUpVote(auth: string, postId: string): Promise<IApiVote> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/upvote', {},
        {reason_code: -1})
        .then(res => res.body);
}

export function apiDownVote(auth: string, postId: string): Promise<IApiVote> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/downvote', {},
        {reason_code: -1})
        .then(res => res.body);
}

export function apiGiveThanks(auth: string, postId: string): Promise<void> {
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/giveThanks', {}, {})
        .then(res => res.body);
}

export function apiPin(auth: string, postId: string): Promise<IApiPin> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/pin', {}, {})
        .then(res => res.body);
}

export function apiUnpin(auth: string, postId: string): Promise<IApiPin> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/posts/' + postId + '/unpin', {}, {})
        .then(res => res.body);
}

export function apiFollowChannel(auth: string, channel: string): Promise<void> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/followChannel', {channel}, {})
        .then(res => res.body);
}

export function apiUnfollowChannel(auth: string, channel: string): Promise<void> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/unfollowChannel', {channel}, {})
        .then(res => res.body);
}

export function apiGetRecommendedChannels(auth: string, home = false): Promise<IApiRecommendedChannels> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/user/recommendedChannels', {home}, {})
        .then(res => res.body);
}

export function apiGetFollowedChannelsMeta(auth: string, channels: { [channelName: string]: number },
                                           home = false): Promise<IApiChannelsMeta> {
    // Format: {"channelName": timestamp, "channel2": timestamp2}
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/user/followedChannelsMeta', {home},
        channels)
        .then(res => res.body);
}

export function apiGetSuggestedHashtags(auth: string, home = false) {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/hashtags/suggested', {home}, {});
}

export function apiAddPost(auth: string, channel: string | undefined, ancestorPostId: string | undefined,
                           color: Color | undefined, locAccuracy: number, latitude: number, longitude: number,
                           city: string, country: string, message: string, image: string | undefined,
                           toHome = false): Promise<IApiPostAdded> {
    // image must be base64 encoded string
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/posts/', {}, {
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

export function apiGetConfig(auth: string): Promise<IApiConfig> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/user/config', {}, {})
        .then(res => res.body);
}

export function apiGetKarma(auth: string): Promise<IApiKarma> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V2 + '/users/karma', {}, {})
        .then(res => res.body);
}

/**
 * Request a link to the verification image captcha
 * expected data from server: {key: String, image_url: String, image_size: Number}
 * @param auth
 * @returns {Promise}
 */
export function apiGetImageCaptcha(auth: string): Promise<IApiImageCaptcha> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/user/verification/imageCaptcha', {}, {})
        .then(res => res.body);
}

/**
 * Send the user's answer back to the server
 * expected data from server: {verified: Boolean}
 * @returns {Promise}
 */
export function apiSendVerificationAnswer(auth: string, key: string, answer: number[]): Promise<IApiVerify> {
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/user/verification/imageCaptcha', {}, {
        answer,
        key,
    })
        .then(res => res.body);
}

export function apiSetLocation(auth: string, latitude: number, longitude: number, city: string,
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
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/users/location', {}, data)
        .then(res => res.body);
}

export function apiSetHome(auth: string, latitude: number, longitude: number, city: string,
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
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/home', {}, data)
        .then(res => res.body);
}

export function apiDeleteHome(auth: string): Promise<void> {
    return jodelRequest(auth, 'DELETE', Settings.API_SERVER + API_PATH_V3 + '/user/home', {}, {})
        .then(res => res.body);
}

export type ApiAction = 'SetHomeStarted' | 'SetHomeCompleted' | 'NewestFeedSelected' | 'MostCommentedFeedSelected';

export function apiSetAction(auth: string, action: ApiAction): Promise<void> {
    const data = {
        action,
    };
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/action', {}, data)
        .then(res => res.body);
}

/**
 * Send Gcm Push token to Jodel server, which will then send a verification code via GCM
 * @param {string} auth
 * @param {string} clientId Fixed Jodel android client id
 * @param {string} pushToken Gcm push token
 */
export function apiSetPushToken(auth: string, clientId: string, pushToken: string): Promise<void> {
    const data = {
        client_id: clientId,
        push_token: pushToken,
    };
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V2 + '/users/pushToken', {}, data)
        .then(res => res.body);
}

export function apiVerifyPush(auth: string, serverTime: number, verificationCode: string): Promise<void> {
    // Verify GCM push
    const data = {
        server_time: serverTime,
        verification_code: verificationCode,
    };
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/user/verification/push', {}, data)
        .then(res => res.body);
}

export function apiGetAccessToken(deviceUid: string, latitude = 0.0, longitude = 0.0, city: string,
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
    return jodelRequest(undefined, 'POST', Settings.API_SERVER + API_PATH_V2 + '/users/', {}, data)
        .then(res => res.body);
}

export function apiRefreshAccessToken(auth: string, distinctId: string,
                                      refreshToken: string): Promise<IApiRefreshToken> {
    const data = {
        current_client_id: Settings.CLIENT_ID,
        distinct_id: distinctId,
        refresh_token: refreshToken,
    };
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V2 + '/users/refreshToken', {}, data)
        .then(res => res.body);
}

export function apiIsNotificationAvailable(auth: string): Promise<IApiNotificationAvailable> {
    return jodelRequest(auth, 'GET', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/new', {}, {})
        .then(res => res.body);
}

export function apiGetNotifications(auth: string): Promise<IApiNotifications> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications', {}, {})
        .then(res => res.body);
}

export function apiSetNotificationPostRead(auth: string, postId: string): Promise<void> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/notifications/post/' + postId + '/read',
        {}, {})
        .then(res => res.body);
}

/**
 * Set the user's language on the server
 * @param auth
 * @param language Language name in ISO 639-1 format, e.g. 'de-de'
 */
export function apiSetUserLanguage(auth: string, language: string) {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/language', {}, {language});
}

/**
 * Set the user's profile on the server
 * @param {string} auth
 * @param {string} userType User profile type, e.g. student
 * @param {Number} [age] User's age
 * @returns {*}
 */
export function apiSetUserProfile(auth: string, userType: UserType, age = 0) {
    const data = {
        age,
        user_type: userType,
    };
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/user/profile', {}, data);
}

/**
 * Share a post, the server generates a url that can be shared.
 * @param {string} auth
 * @param {number} postId The postId you want to share
 * @returns {*} a server generated url
 */
export function apiSharePost(auth: string, postId: string): Promise<IApiShare> {
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/posts/' + postId + '/share', {}, {})
        .then(res => res.body);
}

export function apiSearchPosts(auth: string, message: string, suggested = false,
                               home = false): Promise<request.Response> {
    const data = {
        message,
        suggested,
    };
    return jodelRequest(auth, 'POST', Settings.API_SERVER + API_PATH_V3 + '/posts/search', {home}, data);
}

export function apiStickyPostClose(auth: string, stickyPostId: string): Promise<void> {
    return jodelRequest(auth, 'PUT', Settings.API_SERVER + API_PATH_V3 + '/stickyposts/' + stickyPostId + '/up', {}, {})
        .then(res => res.body);
}
