'use strict';

import React, {Component} from "react";
import PostList from "./PostList";
import {PostListSortTypes} from "../redux/actions";
import SortTypeLink from "./SortTypeLink";
import AddButton from "./AddButton";
import {connect} from "react-redux";

class PostListContainer extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        onPostClick: React.PropTypes.func.isRequired,
        onRefresh: React.PropTypes.func.isRequired,
        onAddClick: React.PropTypes.func.isRequired,
        onLoadMore: React.PropTypes.func.isRequired,
    };

    render() {
        const {posts, section, sortType, lastUpdated, locationKnown, onPostClick, onRefresh, onAddClick, onLoadMore, ...forwardProps} = this.props;
        return (
            <div className="postListContainer">
                <PostList section={section} sortType={sortType} lastUpdated={lastUpdated} posts={posts}
                          onPostClick={onPostClick} onLoadMore={onLoadMore}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ""}
                <div className="sortTypes">
                    <SortTypeLink sortType={PostListSortTypes.RECENT}/>
                    <SortTypeLink sortType={PostListSortTypes.DISCUSSED}/>
                    <SortTypeLink sortType={PostListSortTypes.POPULAR}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const section = state.viewState.get("postSection");
    const sortType = state.viewState.get("postListSortType");
    let posts = state.postsBySection.getIn([section, sortType]);
    if (posts === undefined) {
        posts = [];
    }
    return {
        lastUpdated: state.postsBySection.getIn([section, "lastUpdated"]),
        posts: posts.map(post_id => state.entities.get(post_id)),
        locationKnown: state.viewState.getIn(["location", "latitude"]) !== undefined,
    }
};

export default connect(mapStateToProps)(PostListContainer);
