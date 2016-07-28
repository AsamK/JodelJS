"use strict";

import request from "superagent";
import Settings from "../app/settings";
import CryptoJS from "crypto-js";

function ajax_request(method, headers, url, query, data, callback) {
    let r;
    switch (method) {
        case "GET":
            r = request.get;
            query = {...query, ...data};
            break;
        case "POST":
            r = request.post;
            break;
        case "PUT":
            r = request.put;
            break;
        case "DELETE":
            r = request.delete;
            break;
        default:
            console.log("Method doesn't exist: " + method);
            return;
    }
    let timestamp = new Date().toISOString();
    let sig = computeSignature(method, url, timestamp, data);
    const req = r(url)
        .query(query)
        .set("X-Client-Type", "android_4.12.5")
        .set("X-Api-Version", "0.2")
        .set("X-Timestamp", timestamp)
        .set("X-Authorization", "HMAC " + sig)
        .type("json")
        .send(data);

    Object.keys(headers).forEach((element, index) => req.set(element, headers[element]));
    req.end(callback);
}

function parseUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
}

function computeSignature(method, url, timestamp, data) {
    let u = parseUrl(url);
    let raw = method + "%" + u.hostname + "%" + 443 + "%" + u.pathname + "%" + Settings.AUTH + "%" + timestamp + "%" + "" + "%" + data;
    return CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA1(raw, Settings.KEY));
}

export function jodelRequest(method, url, query, data, callback) {
    let headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + Settings.AUTH
    };
    ajax_request(method, headers, url, query, data, callback);
}

export function apiGetPosts(callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/", {}, {}, callback);
}

export function apiGetPostsCombo(latitude, longitude, callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/location/combo", {
        lat: latitude,
        lng: longitude
    }, {}, callback);
}

export function apiGetPostsPopular(afterPostId, latitude, longitude, callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/location/popular", {
        after: afterPostId,
        lat: latitude,
        lng: longitude
    }, {}, callback);
}

export function apiGetPostsDiscussed(afterPostId, latitude, longitude, callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/location/discussed", {
        after: afterPostId,
        lat: latitude,
        lng: longitude
    }, {}, callback);
}

export function apiGetPostsMineCombo(callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/mine/combo", {}, {}, callback);
}

export function apiGetPostsMineReplies(callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/mine/replies", {}, {}, callback);
}

export function apiGetPostsMinePinned(callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/mine/pinned", {}, {}, callback);
}

export function apiGetPostsMineVotes(skip, limit, callback) {
    let query = {};
    if (skip) {
        query.skip = skip;
    }
    if (limit) {
        query.limit = limit;
    }
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/mine/votes", query, {}, callback);
}

export function apiGetPostsChannelCombo(channel, callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V3 + "/posts/channel/combo", {channel: channel}, {}, callback);
}

export function apiGetPostsChannel(channel, afterPostId, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V3 + "/posts/channel", query, {}, callback);
}

export function apiGetPostsChannelPopular(afterPostId, channel, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V3 + "/posts/channel/popular", query, {}, callback);
}

export function apiGetPostsChannelDiscussed(afterPostId, channel, callback) {
    let query = {channel: channel};
    if (afterPostId) {
        query.after = afterPostId;
    }
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V3 + "/posts/channel/discussed", query, {}, callback);
}


export function apiGetPost(post_id, callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/" + post_id, {}, {}, callback);
}

export function apiUpVote(postId, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/" + postId + "/upvote", {}, {}, callback);
}

export function apiDownVote(postId, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/" + postId + "/downvote", {}, {}, callback);
}

export function apiPin(postId, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/" + postId + "/pin", {}, {}, callback);
}

export function apiUnpin(postId, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/" + postId + "/unpin", {}, {}, callback);
}

export function apiFollowChannel(channel, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V3 + "/user/followChannel", {channel: channel}, {}, callback);
}

export function apiUnfollowChannel(channel, callback) {
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V3 + "/user/unfollowChannel", {channel: channel}, {}, callback);
}

export function apiAddPost(color, loc_accuracy, latitude, longitude, city, country, message, callback) {
    return jodelRequest("POST", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/", {}, {color, message, location: {loc_accuracy, city, country, loc_coordinates: {lat: latitude, lng: longitude}}}, callback);
}

export function apiAddPostComment(ancestorPostId, color, loc_accuracy, latitude, longitude, city, country, message, callback) {
    return jodelRequest("POST", Settings.API_SERVER + Settings.API_PATH_V2 + "/posts/", {}, {ancestor: ancestorPostId, color, message, location: {loc_accuracy, city, country, loc_coordinates: {lat: latitude, lng: longitude}}}, callback);
}

export function apiGetConfig(callback) {
    return jodelRequest("GET", Settings.API_SERVER + Settings.API_PATH_V3 + "/user/config", {}, {}, callback);
}

export function apiSetPlace(latitude, longitude, city, country, callback) {
    let data = {
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
    return jodelRequest("PUT", Settings.API_SERVER + Settings.API_PATH_V2 + "/users/place", {}, data, callback);
}
