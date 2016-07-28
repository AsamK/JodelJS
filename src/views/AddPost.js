import React from "react";
import {connect} from "react-redux";
import {addPost} from "../redux/actions";
import classnames from "classnames";

let AddPost = ({ancestor, visible, dispatch}) => {
    let input;

    return (
        <div className={classnames("addPost", {visible})}>
            <form onSubmit={e => {
                e.preventDefault();
                if (!input.value.trim()) {
                    return
                }
                dispatch(addPost(input.value, ancestor));
                input.value = ''
            }}>
                <textarea ref={node => {
                    input = node
                }}/>
                <button type="submit">
                    Senden
                </button>
            </form>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        ancestor: state.viewState.addPost.ancestor,
        visible: state.viewState.addPost.visible,
    }
};

AddPost = connect(mapStateToProps)(AddPost);

export default AddPost
