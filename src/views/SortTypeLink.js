'use strict';

import React, {PropTypes} from "react";
import {connect} from "react-redux";
import {switchPostListSortType} from "../redux/actions";
import classnames from "classnames";

const SortTypeLink = ({sortType, active, onClick}) => (
    <div className={classnames("sortType", sortType.toLowerCase(), {active})} onClick={onClick}></div>
);

SortTypeLink.propTypes = {
    sortType: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.sortType === state.viewState.get("postListSortType")
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchPostListSortType(ownProps.sortType))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SortTypeLink);
