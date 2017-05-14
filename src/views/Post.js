'use strict';

import React, {PureComponent} from "react";
import {connect} from "react-redux";
import Vote from "./Vote";
import Time from "./Time";
import ChildInfo from "./ChildInfo";
import Location from "./Location";
import Message from "./Message";
import {upVote, downVote, switchPostSection, selectPicture, deletePost, giveThanks} from "../redux/actions";
import classnames from "classnames";
import PropTypes from 'prop-types';

class Post extends PureComponent {
    constructor(props) {
        super(props);
        this.upvote = this.upvote.bind(this);
        this.downvote = this.downvote.bind(this);
        this.pressTimer = undefined;
    }

    static propTypes = {
        post: PropTypes.any.isRequired,
        parentPostId: PropTypes.string,
        author: PropTypes.string,
        onPostClick: PropTypes.func.isRequired
    };

    upvote(e) {
        e.stopPropagation();
        const {dispatch, post, parentPostId} = this.props;
        if (post.has('voted') && post.get("voted") == "up") {
            // Give thanks
            dispatch(giveThanks(post.get("post_id"), parentPostId));
        } else {
            dispatch(upVote(post.get("post_id"), parentPostId));
        }
    }

    downvote(e) {
        e.stopPropagation();
        this.props.dispatch(downVote(this.props.post.get("post_id"), this.props.parentPostId));
    }

    render() {
        const {post, author, onPostClick, ...forwardProps} = this.props;
        return (
            <div className="post" style={{backgroundColor: "#" + post.get("color")}} onClick={onPostClick}>
                {post.has('thumbnail_url') ?
                    <div className="postPicture"
                         style={{backgroundImage: "url(https:" + post.get("thumbnail_url") + ")"}}
                         onMouseUp={e => clearTimeout(this.pressTimer)}
                         onContextMenu={e => {
                             e.preventDefault();
                             clearTimeout(this.pressTimer);
                             this.props.dispatch(selectPicture(post.get("post_id")));
                         }}
                         onMouseDown={e => {
                             clearTimeout(this.pressTimer);
                             this.pressTimer = setTimeout(() => this.props.dispatch(selectPicture(post.get("post_id"))), 300);
                         }}></div>
                    :
                    <Message message={post.get("message")} onAtClick={(e, channel)=> {
                        e.stopPropagation();
                        this.props.dispatch(switchPostSection("channel:" + channel));
                    }} onHashtagClick={(e, hashtag)=> {
                        e.stopPropagation();
                        this.props.dispatch(switchPostSection("hashtag:" + hashtag));
                    }}/>
                }
                <Vote vote_count={post.get("vote_count")} voted={post.has('voted') ? post.get("voted") : ""}
                      upvote={this.upvote} downvote={this.downvote}/>
                <Time time={post.get("created_at")}/>
                <ChildInfo child_count={post.has('child_count') ? post.get("child_count") : 0}/>
                <Location location={post.getIn(["location", "name"])} distance={post.get("distance")}
                          fromHome={post.get("from_home")}/>
                <div className="author">
                    {author != undefined ?
                        <div className={classnames(author, {gotThanks: post.get("got_thanks")})}>
                            {author}
                        </div>
                        : ""}
                </div>
                {post.get("post_own") === "own" ? <a onClick={e => {
                    e.stopPropagation();
                    this.props.dispatch(deletePost(post.get("post_id")))
                }}>delete</a> : ""}
            </div>
        );
    }
}

export default connect()(Post);
