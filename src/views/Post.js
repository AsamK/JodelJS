'use strict';

import React, {PureComponent} from "react";
import {connect} from "react-redux";
import Vote from "./Vote";
import Time from "./Time";
import ChildInfo from "./ChildInfo";
import Location from "./Location";
import Message from "./Message";
import {upVote, downVote, switchPostSection, selectPicture} from "../redux/actions";
import {deletePost} from "../redux/actions/api";

class Post extends PureComponent {
    constructor(props) {
        super(props);
        this.upvote = this.upvote.bind(this);
        this.downvote = this.downvote.bind(this);
        this.pressTimer = undefined;
    }

    static propTypes = {
        post: React.PropTypes.any.isRequired,
        parentPostId: React.PropTypes.string,
        author: React.PropTypes.string,
        onPostClick: React.PropTypes.func.isRequired
    };

    upvote(e) {
        e.stopPropagation();
        this.props.dispatch(upVote(this.props.post.get("post_id"), this.props.parentPostId));
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
                    <Message message={post.get("message")} onHashtagClick={(e, hashtag)=> {
                        e.stopPropagation();
                        this.props.dispatch(switchPostSection("channel:" + hashtag));
                    }}/>
                }
                <Vote vote_count={post.get("vote_count")} voted={post.has('voted') ? post.get("voted") : ""}
                      upvote={this.upvote} downvote={this.downvote}/>
                <Time time={post.get("created_at")}/>
                <ChildInfo child_count={post.has('child_count') ? post.get("child_count") : 0}/>
                <Location location={post.getIn(["location", "name"])} distance={post.get("distance")}/>
                <div className="author">
                    {author != undefined ?
                        <div className={author}>
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
