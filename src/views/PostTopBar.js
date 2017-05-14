import React from "react";
import {connect} from "react-redux";
import BackButton from "./BackButton";
import {selectPost, pin} from "../redux/actions";
import classnames from "classnames";
import PropTypes from 'prop-types';

let PostTopBar = ({onBackClick, onPinClick, post}) => {
    let pinned = post.has("pinned") && post.get("pinned");
    return (
        <div className="postTopBar">
            <BackButton onClick={e => window.history.back()}/>
            <div className="pin">
                {post.has("pin_count") && post.get("pin_count") > 0 ? post.get("pin_count") : ""}
                <div className={classnames("pinButton", {pinned})} onClick={onPinClick}>
                </div>
            </div>
        </div>
    )
};

PostTopBar.propTypes = {
    onBackClick: PropTypes.func,
    post: PropTypes.any.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {}
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onBackClick: () => {
            dispatch(selectPost(null))
        },
        onPinClick: () => {
            let isPinned = ownProps.post.has("pinned") && ownProps.post.get("pinned");
            dispatch(pin(ownProps.post.get("post_id"), !isPinned));
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PostTopBar);
