import * as classnames from 'classnames';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {pin} from '../redux/actions';
import {sharePost} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import BackButton from './BackButton';
import {IPost} from '../interfaces/IPost';

export interface PostTopBarProps {
    post: IPost
}

export interface PostTopBarComponentProps extends PostTopBarProps {
    onBackClick: () => void
    onPinClick: () => void
    onShareClick: () => void
}

let PostTopBarComponent = ({onBackClick, onPinClick, onShareClick, post}: PostTopBarComponentProps) => {
    let pinned = post.pinned && post.pinned;
    return (
        <div className="postTopBar">
            <BackButton onClick={onBackClick}/>
            {post.shareable && post.shareable ?
                <div className="share">
                    {post.share_count && post.share_count > 0 ? post.share_count : ''}
                    <div className="shareButton" onClick={onShareClick}>
                    </div>
                </div>
                : ''}
            <div className="pin">
                {post.pin_count && post.pin_count > 0 ? post.pin_count : ''}
                <div className={classnames('pinButton', {pinned})} onClick={onPinClick}>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: PostTopBarProps) => {
    return {
        onBackClick: () => {
            window.history.back();
        },
        onPinClick: () => {
            let isPinned = ownProps.post.pinned && ownProps.post.pinned;
            dispatch(pin(ownProps.post.post_id, !isPinned));
        },
        onShareClick: () => {
            dispatch(sharePost(ownProps.post.post_id));
        },
    };
};

export const PostTopBar = connect(mapStateToProps, mapDispatchToProps)(PostTopBarComponent);
