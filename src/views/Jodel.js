'use strict';

import React, {Component} from "react";
import classnames from 'classnames';

import PostList from "./PostList";
import PostDetails from "./PostDetails";
import {apiGetPosts, apiSetPlace, apiGetPost, apiGetConfig} from "../app/api";

export default class Jodel extends Component {
    state = {
        currentPost: null,
        posts: []
    };

    componentDidMount() {
        apiGetConfig((err, res) => console.log(res.body));
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(function (position) {
                apiSetPlace(position.coords.latitude, position.coords.longitude, "Nimmerland", "DE");
            });
        }
        this.refresh();
        this.timer = setInterval(this.refresh.bind(this), 2000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    refresh() {
        apiGetPosts((err, res) => {
            this.setState({posts: res.body['posts']})
        });
        if (this.state.currentPost != null) {
            apiGetPost(this.state.currentPost.post_id, (err, res) => {
                if (err == null && res != null && this.state.currentPost != null) {
                    this.setState({currentPost: res.body})
                }
            });
        }
    }

    handleClick(post) {
        this.setState({currentPost: post});
        this.refresh();
    }

    render() {
        return <div className="jodel">
            <div className={classnames("list", {postShown: this.state.currentPost != null})}>
                <PostList posts={this.state.posts} onPostClick={this.handleClick.bind(this)}/>
            </div>
            <div className={classnames("detail", {postShown: this.state.currentPost != null})}>
                <PostDetails post={this.state.currentPost != null ? this.state.currentPost : getEmptyPost()}
                             onPostClick={this.handleClick.bind(this, null)}/>
            </div>
        </div>;
    }
}

function getEmptyPost() {
    return {
        "updated_at": "0000-00-00T00:00:00.000Z",
        "tags": [],
        "user_handle": "",
        "ptp_post": true,
        "team_vote_count": 0,
        "up_votes": [],
        "message": "",
        "distance": 0,
        "sum_votes_count": 0,
        "discovered_by": 0,
        "created_at": "0000-00-00T00:00:00.000Z",
        "post_own": "team",
        "down_votes": [],
        "discovered": 0,
        "vote_count": 0,
        "post_id": "",
        "location": {"name": "", "loc_coordinates": {"lng": 0, "lat": 0}},
        "color": "000000"
    }
}
/*
 function notifyUser(text, sound) {
 if (pageActive) {
 return;
 }
 var audio = new Audio('tarot/static/' + sound + '.mp3');
 audio.play();
 }

 let pageActive = true;
 window.addEventListener("focus", () => pageActive = true);
 window.addEventListener("blur", () => pageActive = false);
 */