"use strict";

import request from "superagent";
import Settings from "../app/settings";
import crypto from "crypto";
import {PostListSortTypes} from "../redux/actions";

const API_PATH_V2 = "/v2";
const API_PATH_V3 = "/v3";

function parseUrl(url) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser;
}

function computeSignature(auth, method, url, timestamp, data) {
    const u = parseUrl(url);
    let path = u.pathname;
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    let raw = method + "%" + u.hostname + "%" + 443 + "%" + path + "%" + auth + "%" + timestamp + "%" + "" + "%" + data;

    const hmac = crypto.createHmac('sha1', Settings.KEY);
    hmac.setEncoding('hex');
    hmac.write(raw);
    hmac.end();
    return hmac.read();
}

export function jodelRequest(auth, method, url, query, data) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(data);
        const timestamp = new Date().toISOString();
        const sig = computeSignature(auth, method, url, timestamp, dataString);

        const req = request(method, url)
            .query(query)
            .type("json")
            .set('Accept', 'application/json')
            .set('Authorization', auth !== "" ? 'Bearer ' + auth : undefined)
            .set("X-Client-Type", Settings.CLIENT_TYPE)
            .set("X-Api-Version", "0.2")
            .set("X-Timestamp", timestamp)
            .set("X-Authorization", sig != null ? "HMAC " + sig.toString() : undefined)
            .set("Content-Type", "application/json; charset=UTF-8")
            .send(dataString)
            .end((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
    });
}

/*export function apiGetPosts(callback) {
 return jodelRequest("GET", Settings.API_SERVER + API_PATH_V2 + "/posts/", {}, {});
 }*/

export function apiGetPostsCombo(auth, latitude, longitude, stickies = true, home = false) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/location/combo", {
        lat: latitude,
        lng: longitude,
        stickies,
        home,
    }, {});
}

export function apiGetPosts(auth, sortType, afterPostId, latitude, longitude, home = false) {
    let type;
    switch (sortType) {
        case PostListSortTypes.RECENT:
            type = "";
            break;
        case PostListSortTypes.DISCUSSED:
            type = "discussed";
            break;
        case PostListSortTypes.POPULAR:
            type = "popular";
            break;
        default:
            throw "Unknown sort type";
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/location/" + type, {
        after: afterPostId,
        lat: latitude,
        lng: longitude,
        home,
    }, {});
}

export function apiGetPostsMineCombo(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/combo", {}, {});
}

export function apiGetPostsMine(auth, sortType, skip, limit) {
    let type;
    switch (sortType) {
        case PostListSortTypes.RECENT:
            type = "";
            break;
        case PostListSortTypes.DISCUSSED:
            type = "discussed";
            break;
        case PostListSortTypes.POPULAR:
            type = "popular";
            break;
        default:
            throw "Unknown sort type";
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/" + type, {
        skip,
        limit
    }, {});
}

export function apiGetPostsMineReplies(auth, skip, limit) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/replies", {
        skip,
        limit
    }, {});
}

export function apiGetPostsMinePinned(auth, skip, limit) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/pinned", {
        skip,
        limit
    }, {});
}

export function apiGetPostsMineVotes(auth, skip, limit) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/votes", {
        skip,
        limit
    }, {});
}

export function apiGetPostsChannelCombo(auth, channel, home = false) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/combo", {channel, home}, {});
}

export function apiGetPostsChannel(auth, sortType, afterPostId, channel, home = false) {
    let type;
    switch (sortType) {
        case PostListSortTypes.RECENT:
            type = "";
            break;
        case PostListSortTypes.DISCUSSED:
            type = "discussed";
            break;
        case PostListSortTypes.POPULAR:
            type = "popular";
            break;
        default:
            throw "Unknown sort type";
    }
    let query = {
        channel: channel,
        after: afterPostId,
        home,
    };
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/" + type, query, {});
}

export function apiGetPostsHashtagCombo(auth, hashtag, home = false) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/hashtag/combo", {hashtag, home}, {});
}

export function apiGetPostsHashtag(auth, sortType, afterPostId, hashtag, home = false) {
    let type;
    switch (sortType) {
        case PostListSortTypes.RECENT:
            type = "";
            break;
        case PostListSortTypes.DISCUSSED:
            type = "discussed";
            break;
        case PostListSortTypes.POPULAR:
            type = "popular";
            break;
        default:
            throw "Unknown sort type";
    }
    let query = {
        hashtag,
        after: afterPostId,
        home,
    };
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/hashtag/" + type, query, {});
}

export function apiGetPost(auth, post_id) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/" + post_id, {}, {});
}

export function apiGetPostDetails(auth, post_id, details = true, nextReply, reversed = false) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/" + post_id + "/details", {
        details: details,
        reply: nextReply,
        reversed: reversed,
    }, {});
}

export function apiDeletePost(auth, postId) {
    return jodelRequest(auth, "DELETE", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId, {}, {});
}

export function apiUpVote(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/upvote", {}, {reason_code: -1});
}

export function apiDownVote(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/downvote", {}, {reason_code: -1});
}

export function apiGiveThanks(auth, postId) {
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V3 + "/posts/" + postId + "/giveThanks", {}, {});
}

export function apiPin(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/pin", {}, {});
}

export function apiUnpin(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/unpin", {}, {});
}

export function apiFollowChannel(auth, channel) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/followChannel", {channel}, {});
}

export function apiUnfollowChannel(auth, channel) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/unfollowChannel", {channel}, {});
}

export function apiGetRecommendedChannels(auth, home = false) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/user/recommendedChannels", {home}, {});
}

export function apiGetFollowedChannelsMeta(auth, channels, home = false) {
    // Format: {"channelName": timestamp, "channel2": timestamp2}
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V3 + "/user/followedChannelsMeta", {home}, channels);
}

export function apiAddPost(auth, channel, ancestorPostId, color, loc_accuracy, latitude, longitude, city, country, message, image, toHome = false) {
    // image must be base64 encoded string
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V3 + "/posts/", {}, {
        channel,
        ancestor: ancestorPostId,
        color,
        message,
        image,
        location: {loc_accuracy, city, name: city, country, loc_coordinates: {lat: latitude, lng: longitude}},
        to_home: toHome,
    });
}

export function apiGetConfig(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/user/config", {}, {});
}

export function apiGetKarma(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/users/karma", {}, {});
}

export function apiSetLocation(auth, latitude, longitude, city, country) {
    const data = {
        location: {
            loc_accuracy: 0.0,
            city,
            loc_coordinates: {
                lat: latitude,
                lng: longitude
            },
            country,
            name: city,
        }
    };
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/users/location", {}, data);
}

export function apiSetHome(auth, latitude, longitude, city, country) {
    const data = {
        location: {
            loc_accuracy: 0.0,
            city,
            loc_coordinates: {
                lat: latitude,
                lng: longitude
            },
            country,
            name: city,
        }
    };
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/home", {}, data);
}

// Possible actions: SetHomeStarted, SetHomeCompleted
export function apiSetAction(auth, action) {
    const data = {
        action,
    };
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V3 + "/action", {}, data);
}

export function apiSetPushToken(auth, clientId, pushToken) {
    // Set GCM push token
    const data = {
        client_id: clientId,
        push_token: pushToken,
    };
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/users/pushToken", {}, data);
}

export function apiVerifyPush(auth, serverTime, verificationCode) {
    // Verify GCM push
    const data = {
        server_time: serverTime,
        verification_code: verificationCode,
    };
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V3 + "/user/verification/push", {}, data);
}

export function apiGetAccessToken(deviceUid, latitude = 0.0, longitude = 0.0, city, country) {
    const data = {
        "client_id": Settings.CLIENT_ID,
        "device_uid": deviceUid,
        "location": {
            "loc_accuracy": 0.0,
            "city": city,
            "loc_coordinates": {
                "lat": latitude,
                "lng": longitude
            },
            "country": country
        }
    };
    return jodelRequest(undefined, "POST", Settings.API_SERVER + API_PATH_V2 + "/users/", {}, data);
}

export function apiRefreshAccessToken(auth, distinctId, refreshToken) {
    const data = {
        "current_client_id": Settings.CLIENT_ID,
        "distinct_id": distinctId,
        "refresh_token": refreshToken,
    };
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V2 + "/users/refreshToken", {}, data);
}
