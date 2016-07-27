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
    PostListContainerStates,
    updateLocation,
    updatePosts
} from "../redux/actions";
import {switchPostSection} from "../redux/actions";

class Jodel extends Component {
    componentDidMount() {
        apiGetConfig((err, res) => {
            console.log(res.body)
        });
        this.props.dispatch(updateLocation());
        this.props.dispatch(switchPostSection("location"));
        this.refresh();
        this.timer = setInterval(this.props.refresh, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    onRefresh() {
        this.props.dispatch(updatePosts())
    }

    refresh() {
        this.props.dispatch(fetchPostsIfNeeded());
        if (this.props.selectedPost != null) {
            this.props.dispatch(fetchPost(this.props.selectedPost.post_id));
        }
    }

    handleClick(post) {
        this.props.dispatch(selectPost(post != null ? post.post_id : null));
    }

    render() {
        return <div className="jodel">
            <div className={classnames("list", {postShown: this.props.selectedPost != null})}>
                <PostListContainer posts={this.props.posts} onPostClick={this.handleClick.bind(this)}
                                   onRefresh={this.onRefresh}/>
            </div>
            <div className={classnames("detail", {postShown: this.props.selectedPost != null})}>
                <PostDetails post={this.props.selectedPost != null ? this.props.selectedPost : getEmptyPost()}
                             onPostClick={this.handleClick.bind(this, null)}/>
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
    let items;
    console.log(state);
    const section = state.viewState.postSection;
    if (section) {
        switch (state.viewState.postListContainerState) {
            case PostListContainerStates.RECENT:
                items = state.postsBySection[section].itemsRecent;
                break;
            case PostListContainerStates.DISCUSSED:
                items = state.postsBySection[section].itemsDiscussed;
                break;
            case PostListContainerStates.POPULAR:
                items = state.postsBySection[section].itemsPopular;
        }
    } else {
        items = [];
    }
    return {
        section: state.viewState.postSection,
        posts: items.map(post_id => state.entities[post_id]),
        selectedPost: state.viewState.selectedPostId != null ? state.entities[state.viewState.selectedPostId] : null
    }
};

export default connect(mapStateToProps)(Jodel);
