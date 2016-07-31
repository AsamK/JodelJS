'use strict';

import React, {Component} from "react";
import PostList from "./PostList";
import {PostListSortTypes} from "../redux/actions";
import SectionLink from "./SectionLink";
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
        const {posts, section, sortType, locationKnown, onPostClick, onRefresh, onAddClick, onLoadMore, ...forwardProps} = this.props;
        return (
            <div className="postListContainer">
                <PostList section={section} sortType={sortType} posts={posts} onPostClick={onPostClick} onLoadMore={onLoadMore}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ""}
                <div className="sections">
                    <SectionLink section={PostListSortTypes.RECENT}/>
                    <SectionLink section={PostListSortTypes.DISCUSSED}/>
                    <SectionLink section={PostListSortTypes.POPULAR}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    let posts;
    const section = state.viewState.postSection;
    const sortType = state.viewState.postListSortType;
    if (section !== undefined && state.postsBySection[section] !== undefined && state.postsBySection[section][sortType] !== undefined) {
        posts = state.postsBySection[section][sortType];
    } else {
        posts = [];
    }
    return {
        section,
        sortType,
        posts: posts.map(post_id => state.entities[post_id]),
        locationKnown: state.viewState.location.latitude !== undefined,
    }
};

export default connect(mapStateToProps)(PostListContainer);
