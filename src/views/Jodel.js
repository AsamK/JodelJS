'use strict';

import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import PostListContainer from "./PostListContainer";
import PostDetails from "./PostDetails";
import AddPost from "./AddPost";
import TopBar from "./TopBar";
import FirstStart from "./FirstStart";
import AppSettings from "./AppSettings";
import Progress from "./Progress";
import {
    fetchPostsIfNeeded,
    selectPost,
    updatePosts,
    showAddPost,
    fetchMorePosts,
    switchPostSection,
    showSettings,
    selectPicture
} from "../redux/actions";

class Jodel extends Component {
    componentDidMount() {
        this.timer = setInterval(this.refresh.bind(this), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    onRefresh() {
        this.props.dispatch(updatePosts())
    }

    refresh() {
        if (!this.props.isRegistered) {
            return;
        }
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

    switchPostSection(section) {
        this.props.dispatch(switchPostSection(section));
    }

    render() {
        if (this.props.deviceUid === undefined) {
            return <div className="jodel">
                <FirstStart/>
            </div>
        } else if (this.props.settings.visible) {
            return <AppSettings/>
        } else {
            return <div className="jodel">
                <TopBar karma={this.props.karma} switchPostSection={this.switchPostSection.bind(this)}
                        showSettings={() => this.props.dispatch(showSettings(true))}/>
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
                {this.props.selectedPicturePost !== null ?
                    <div className="bigPicture" onMouseUp={e => this.props.dispatch(selectPicture(null))}>
                        <img alt={this.props.selectedPicturePost.message}
                             src={"https:" + this.props.selectedPicturePost.thumbnail_url}/>
                        <img alt={this.props.selectedPicturePost.message}
                             src={"https:" + this.props.selectedPicturePost.image_url}/>
                    </div>
                    : ""}
                <AddPost/>
                <Progress/>
            </div>;
        }
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
    let selectedPicturePost = null;
    if (state.viewState.selectedPicturePostId != null) {
        let post = state.entities[state.viewState.selectedPicturePostId];
        if (post !== undefined) {
            selectedPicturePost = post;
        }
    }
    return {
        section: state.viewState.postSection,
        selectedPost: state.viewState.selectedPostId != null ? state.entities[state.viewState.selectedPostId] : null,
        selectedPicturePost,
        locationKnown: state.viewState.location.latitude !== undefined,
        settings: state.viewState.settings,
        karma: state.account.karma,
        deviceUid: state.account.deviceUid,
        isRegistered: state.account.token !== undefined && state.account.token.access !== undefined,
    }
};

export default connect(mapStateToProps)(Jodel);
