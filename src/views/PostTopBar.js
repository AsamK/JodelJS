import React, {PropTypes} from "react";
import {connect} from "react-redux";
import BackButton from "./BackButton";
import {selectPost} from "../redux/actions";

let PostTopBar = ({onBackClick, showSettings}) => {
    return (
        <div className="postTopBar">
            <BackButton onClick={onBackClick}/>
        </div>
    )
};

PostTopBar.propTypes = {
    onBackClick: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    return {
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onBackClick: () => {
            dispatch(selectPost(null))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PostTopBar);
