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
        posts: React.PropTypes.array.isRequired,
        onPostClick: React.PropTypes.func.isRequired,
        onRefresh: React.PropTypes.func.isRequired,
        onAddClick: React.PropTypes.func.isRequired,
    };

    render() {
        const {posts, onPostClick, onRefresh, onAddClick, ...forwardProps} = this.props;
        return (
            <div className="postListContainer">
                <PostList posts={posts} onPostClick={onPostClick}/>
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


export default connect()(PostListContainer);
