import * as classnames from 'classnames';
import * as React from 'react';
import {connect} from 'react-redux';
import {pin} from '../redux/actions';
import {sharePost} from '../redux/actions/api';
import BackButton from './BackButton';

export interface PostTopBarProps {
    onBackClick: () => void
    onPinClick: () => void
    onShareClick: () => void
    post: any
}

let PostTopBar = ({onBackClick, onPinClick, onShareClick, post}) => {
    let pinned = post.has('pinned') && post.get('pinned');
    return (
        <div className="postTopBar">
            <BackButton onClick={onBackClick}/>
            {post.has('shareable') && post.get('shareable') ?
                <div className="share">
                    {post.has('share_count') && post.get('share_count') > 0 ? post.get('share_count') : ''}
                    <div className="shareButton" onClick={onShareClick}>
                    </div>
                </div>
                : ''}
            <div className="pin">
                {post.has('pin_count') && post.get('pin_count') > 0 ? post.get('pin_count') : ''}
                <div className={classnames('pinButton', {pinned})} onClick={onPinClick}>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state, ownProps) => {
    return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onBackClick: () => {
            window.history.back();
        },
        onPinClick: () => {
            let isPinned = ownProps.post.has('pinned') && ownProps.post.get('pinned');
            dispatch(pin(ownProps.post.get('post_id'), !isPinned));
        },
        onShareClick: () => {
            dispatch(sharePost(ownProps.post.get('post_id')));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostTopBar);
