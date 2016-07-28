import React from "react";
import {connect} from "react-redux";
import {addPost} from "../redux/actions";
import classnames from "classnames";

let AddButton = ({onClick}) => {
    return (
        <div className="addButton" onClick={onClick}>
        </div>
    )
};

export default AddButton
