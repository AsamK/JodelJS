'use strict';

import React, {Component} from "react";
import Vote from "./Vote";
import Time from "./Time";
import ChildInfo from "./ChildInfo";
import Location from "./Location";
import {apiUpVote, apiDownVote} from "../app/api";

export default class Post extends Component {
    constructor(props) {
        super(props);
        this.upvote = this.upvote.bind(this);
        this.downvote = this.downvote.bind(this);
    }

    static propTypes = {
        post: React.PropTypes.any.isRequired,
        author: React.PropTypes.string,
        onPostClick: React.PropTypes.func.isRequired
    };

    upvote(e) {
        e.stopPropagation();
        apiUpVote(this.props.post.post_id, (err, res) => {
            if (err == null && res.body != null) {
                console.log(res.body.post);
            }
        });
    }

    downvote(e) {
        e.stopPropagation();
        apiDownVote(this.props.post.post_id, (err, res) => {
            if (err == null && res.body != null) {
                console.log(res.body.post);
            }
        });
    }

    render() {
        const {post, author, onPostClick, ...forwardProps} = this.props;
        return (
            <div className="post" style={{backgroundColor: "#" + post.color}} onClick={onPostClick}>
                {post.hasOwnProperty('thumbnail_url') ?
                    <a href={"https:" + post.image_url} target="_blank" onClick={(e) => {e.stopPropagation();return false;}}>
                        <div className="postPicture"
                             style={{backgroundImage: "url(https:" + post.thumbnail_url + ")"}}></div>
                    </a> :
                    <div className="postMessage">{post.message}</div>
                }
                <Vote vote_count={post.vote_count} voted={post.hasOwnProperty('voted') ? post.voted : ""}
                      upvote={this.upvote} downvote={this.downvote}/>
                <Time time={post.created_at}/>
                <ChildInfo child_count={post.hasOwnProperty('child_count') ? post.child_count : 0}/>
                <Location location={post.location.name} distance={post.distance}/>
                <div className="author">{author != undefined ? author : ""}</div>
            </div>
        );
    }
};