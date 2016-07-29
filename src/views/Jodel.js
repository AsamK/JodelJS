'use strict';

import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import PostListContainer from "./PostListContainer";
import PostDetails from "./PostDetails";
import AddPost from "./AddPost";
import {apiGetConfig} from "../app/api";
import {
    fetchPostsIfNeeded,
    fetchPost,
    selectPost,
    updateLocation,
    updatePosts,
    showAddPost,
    fetchMorePosts,
    switchPostSection
} from "../redux/actions";

class Jodel extends Component {
    componentDidMount() {
        apiGetConfig((err, res) => {
            console.log(res.body)
        });
        this.props.dispatch(updateLocation());
        this.props.dispatch(switchPostSection("location"));
        //this.props.dispatch(switchPostSection("mine"));
        this.refresh();
        this.timer = setInterval(this.refresh.bind(this), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    onRefresh() {
        this.props.dispatch(updatePosts())
    }

    refresh() {
        this.props.dispatch(fetchPostsIfNeeded());
    }

    handleClick(post) {
        this.props.dispatch(selectPost(post != null ? post.post_id : null));
    }

    handleAddClick(post) {
        this.props.dispatch(showAddPost(true));
    }

    handleAddCommentClick(post) {
        this.props.dispatch(showAddPost(true, this.props.selectedPost.post_id));
    }

    onLoadMore() {
        this.props.dispatch(fetchMorePosts());
    }

    render() {
        return <div className="jodel">
            <div className={classnames("list", {postShown: this.props.selectedPost != null})}>
                <PostListContainer onPostClick={this.handleClick.bind(this)}
                                   onRefresh={this.onRefresh} onAddClick={this.handleAddClick.bind(this)}
                                   onLoadMore={this.onLoadMore.bind(this)}/>
            </div>
            <div className={classnames("detail", {postShown: this.props.selectedPost != null})}>
                <PostDetails post={this.props.selectedPost != null ? this.props.selectedPost : getEmptyPost()}
                             onPostClick={this.handleClick.bind(this, null)}
                             onAddClick={this.handleAddCommentClick.bind(this)}
                             locationKnown={this.props.locationKnown}/>
            </div>
            <AddPost/>
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

const mapStateToProps = (state) => {
    return {
        section: state.viewState.postSection,
        selectedPost: state.viewState.selectedPostId != null ? state.entities[state.viewState.selectedPostId] : null,
        locationKnown: state.viewState.location.latitude !== undefined,
    }
};

export default connect(mapStateToProps)(Jodel);
