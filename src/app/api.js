"use strict";

import request from "superagent";
import Settings from "../app/settings";
import HmacSHA1 from "crypto-js/hmac-sha1";
import Hex from "crypto-js/enc-hex";
import {PostListSortTypes} from "../redux/actions";

const API_PATH_V2 = Settings.API_PATH + "/v2";
const API_PATH_V3 = Settings.API_PATH + "/v3";

function parseUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
}

function computeSignature(auth, method, url, timestamp, data) {
    let u = parseUrl(url);
    let raw = method + "%" + u.hostname + "%" + 443 + "%" + u.pathname + "%" + auth + "%" + timestamp + "%" + "" + "%" + data;
    return Hex.stringify(HmacSHA1(raw, Settings.KEY));
}

export function jodelRequest(auth, method, url, query, data, callback) {
    data = JSON.stringify(data);
    let timestamp = new Date().toISOString();
    let sig = computeSignature(auth !== undefined ? auth : "", method, url, timestamp, data);

    const req = request(method, url)
        .query(query)
        .type("json")
        .set('Accept', 'application/json')
        .set('Authorization', auth !== undefined ? 'Bearer ' + auth : undefined)
        .set("X-Client-Type", Settings.CLIENT_TYPE)
        .set("X-Api-Version", "0.2")
        .set("X-Timestamp", timestamp)
        .set("X-Authorization", "HMAC " + sig)
        .send(data)
        .end(callback);
}

/*export function apiGetPosts(callback) {
 return jodelRequest("GET", Settings.API_SERVER + API_PATH_V2 + "/posts/", {}, {}, callback);
 }*/

export function apiGetPostsCombo(auth, latitude, longitude, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/location/combo", {
        lat: latitude,
        lng: longitude
    }, {}, callback);
}

export function apiGetPosts(auth, sortType, afterPostId, latitude, longitude, callback) {
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
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/location/" + type, {
        after: afterPostId,
        lat: latitude,
        lng: longitude
    }, {}, callback);
}

export function apiGetPostsMineCombo(auth, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/combo", {}, {}, callback);
}

export function apiGetPostsMine(auth, sortType, skip, limit, callback) {
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
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/" + type, {
        skip,
        limit
    }, {}, callback);
}

export function apiGetPostsMineReplies(auth, skip, limit, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/replies", {
        skip,
        limit
    }, {}, callback);
}

export function apiGetPostsMinePinned(auth, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/pinned", {}, {}, callback);
}

export function apiGetPostsMineVotes(auth, skip, limit, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/votes", {
        skip,
        limit
    }, {}, callback);
}

export function apiGetPostsChannelCombo(auth, channel, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/combo", {channel: channel}, {}, callback);
}

export function apiGetPostsChannel(auth, channel, afterPostId, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel", query, {}, callback);
}

export function apiGetPostsChannelPopular(auth, afterPostId, channel, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/popular", query, {}, callback);
}

export function apiGetPostsChannelDiscussed(auth, afterPostId, channel, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/discussed", query, {}, callback);
}


export function apiGetPost(auth, post_id, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/" + post_id, {}, {}, callback);
}

export function apiUpVote(auth, postId, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/upvote", {}, {}, callback);
}

export function apiDownVote(auth, postId, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/downvote", {}, {}, callback);
}

export function apiPin(auth, postId, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/pin", {}, {}, callback);
}

export function apiUnpin(auth, postId, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/unpin", {}, {}, callback);
}

export function apiFollowChannel(auth, channel, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/followChannel", {channel: channel}, {}, callback);
}

export function apiUnfollowChannel(auth, channel, callback) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/unfollowChannel", {channel: channel}, {}, callback);
}

export function apiAddPost(auth, ancestorPostId, color, loc_accuracy, latitude, longitude, city, country, message, callback) {
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V2 + "/posts/", {}, {
        ancestor: ancestorPostId,
        color,
        message,
        location: {loc_accuracy, city, country, loc_coordinates: {lat: latitude, lng: longitude}}
    }, callback);
}

export function apiGetConfig(auth, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/user/config", {}, {}, callback);
}

export function apiGetKarma(auth, callback) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/users/karma", {}, {}, callback);
}

export function apiSetPlace(auth, latitude, longitude, city, country, callback) {
    const data = {
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
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/users/place", {}, data, callback);
}

export function apiGetAccessToken(deviceUid, latitude, longitude, city, country, callback) {
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
    return jodelRequest(undefined, "POST", Settings.API_SERVER + API_PATH_V2 + "/users/", {}, data, callback);
}

export function apiRefreshAccessToken(auth, distinctId, refreshToken, callback) {
    const data = {
        "current_client_id": Settings.CLIENT_ID,
        "distinct_id": distinctId,
        "refresh_token": refreshToken,
    };
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V2 + "/users/refreshToken", {}, data, callback);
}
