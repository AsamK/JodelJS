import React from 'react'
import { connect } from 'react-redux'
import { addPost } from '../redux/actions'

let AddPost = ({ dispatch }) => {
    let input;

    return (
        <div className="addPost">
            <form onSubmit={e => {
                e.preventDefault();
                if (!input.value.trim()) {
                    return
                }
                dispatch(addPost(input.value));
                input.value = ''
            }}>
                <textarea ref={node => {
                    input = node
                }} />
                <button type="submit">
                    Add Todo
                </button>
            </form>
        </div>
    )
};

AddPost = connect()(AddPost);

export default AddPost
