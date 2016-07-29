'use strict';

import React, {PropTypes} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {switchPostListSortType} from "../redux/actions";

const SectionLink = ({section, onClick}) => (
    <div className={classnames("section ", section.toLowerCase())} onClick={onClick}></div>
)

SectionLink.propTypes = {
    section: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.section === state.viewState.postListContainerState
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchPostListSortType(ownProps.section))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SectionLink);
