'use strict';

import React, {Component} from "react";
import PostList from "./PostList";
import {PostListContainerStates} from "../redux/actions";
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
        const {posts, listState, onPostClick, onRefresh, onAddClick, onLoadMore, ...forwardProps} = this.props;
        return (
            <div className="postListContainer">
                <PostList listState={listState} posts={posts} onPostClick={onPostClick} onLoadMore={onLoadMore}/>
                <AddButton onClick={onAddClick}/>
                <div className="sections">
                    <SectionLink section={PostListContainerStates.RECENT}></SectionLink>
                    <SectionLink section={PostListContainerStates.DISCUSSED}></SectionLink>
                    <SectionLink section={PostListContainerStates.POPULAR}></SectionLink>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    let items;
    const section = state.viewState.postSection;
    if (section && state.postsBySection[section]) {
        switch (state.viewState.postListContainerState) {
            case PostListContainerStates.RECENT:
                items = state.postsBySection[section].itemsRecent;
                break;
            case PostListContainerStates.DISCUSSED:
                items = state.postsBySection[section].itemsDiscussed;
                break;
            case PostListContainerStates.POPULAR:
                items = state.postsBySection[section].itemsPopular;
                break;
        }
    } else {
        items = [];
    }
    return {
        listState: state.viewState.postListContainerState,
        posts: items.map(post_id => state.entities[post_id]),
    }
};

export default connect(mapStateToProps)(PostListContainer);
