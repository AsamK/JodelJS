"use strict";

import request from "superagent";
import Settings from "../app/settings";
import crypto from "crypto";
import {PostListSortTypes} from "../redux/actions";

const API_PATH_V2 = "/v2";
const API_PATH_V3 = "/v3";

function parseUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
}

function computeSignature(auth, method, url, timestamp, data) {
    let u = parseUrl(url);
    var path = u.pathname;
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    let raw = method + "%" + u.hostname + "%" + 443 + "%" + path + "%" + auth + "%" + timestamp + "%" + "" + "%" + data;

    var hmac = crypto.createHmac('sha1', Settings.KEY);
    hmac.setEncoding('hex');
    hmac.write(raw);
    hmac.end();
    var result = hmac.read();
    return result;
}

export function jodelRequest(auth, method, url, query, data) {
    return new Promise((resolve, reject) => {
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

export function apiGetPostsCombo(auth, latitude, longitude) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/location/combo", {
        lat: latitude,
        lng: longitude
    }, {});
}

export function apiGetPosts(auth, sortType, afterPostId, latitude, longitude) {
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

export function apiGetPostsMinePinned(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/pinned", {}, {});
}

export function apiGetPostsMineVotes(auth, skip, limit) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/mine/votes", {
        skip,
        limit
    }, {});
}

export function apiGetPostsChannelCombo(auth, channel) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/combo", {channel: channel}, {});
}

export function apiGetPostsChannel(auth, channel, afterPostId) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel", query, {});
}

export function apiGetPostsChannelPopular(auth, afterPostId, channel) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/popular", query, {});
}

export function apiGetPostsChannelDiscussed(auth, afterPostId, channel) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/posts/channel/discussed", query, {});
}


export function apiGetPost(auth, post_id) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/posts/" + post_id, {}, {});
}

export function apiDeletePost(auth, postId) {
    return jodelRequest(auth, "DELETE", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId, {}, {});
}

export function apiUpVote(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/upvote", {}, {});
}

export function apiDownVote(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/downvote", {}, {});
}

export function apiPin(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/pin", {}, {});
}

export function apiUnpin(auth, postId) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/posts/" + postId + "/unpin", {}, {});
}

export function apiFollowChannel(auth, channel) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/followChannel", {channel: channel}, {});
}

export function apiUnfollowChannel(auth, channel) {
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V3 + "/user/unfollowChannel", {channel: channel}, {});
}

export function apiAddPost(auth, ancestorPostId, color, loc_accuracy, latitude, longitude, city, country, message, image) {
    // image must be base64 encoded string
    return jodelRequest(auth, "POST", Settings.API_SERVER + API_PATH_V2 + "/posts/", {}, {
        ancestor: ancestorPostId,
        color,
        message,
        image,
        location: {loc_accuracy, city, country, loc_coordinates: {lat: latitude, lng: longitude}}
    });
}

export function apiGetConfig(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V3 + "/user/config", {}, {});
}

export function apiGetKarma(auth) {
    return jodelRequest(auth, "GET", Settings.API_SERVER + API_PATH_V2 + "/users/karma", {}, {});
}

export function apiSetPlace(auth, latitude, longitude, city, country) {
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
    return jodelRequest(auth, "PUT", Settings.API_SERVER + API_PATH_V2 + "/users/place", {}, data);
}

export function apiGetAccessToken(deviceUid, latitude, longitude, city, country) {
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
