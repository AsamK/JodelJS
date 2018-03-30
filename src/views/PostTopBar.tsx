import classnames from 'classnames';
import React from 'react';
import {connect, Dispatch} from 'react-redux';
import {IPost} from '../interfaces/IPost';
import {pin} from '../redux/actions';
import {ojFilterPost, sharePost} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import BackButton from './BackButton';

export interface IPostTopBarProps {
    post: IPost;
}

export interface IPostTopBarComponentProps extends IPostTopBarProps {
    onBackClick: () => void;
    onPinClick: () => void;
    onShareClick: () => void;
    onOjFilterClick: () => void;
}

const PostTopBarComponent = (props: IPostTopBarComponentProps) => {
    const {onBackClick, onOjFilterClick, onPinClick, onShareClick, post} = props;
    const pinned = post.pinned && post.pinned;
    return (
        <div className="postTopBar">
            <BackButton onClick={onBackClick}/>
            <div className="rightButtons">
                {post.shareable && post.shareable ?
                    <div className="share">
                        {post.share_count && post.share_count > 0 ? post.share_count : ''}
                        <div className="shareButton" onClick={onShareClick}>
                        </div>
                    </div>
                    : ''}
                <div className="oj-filter">
                    <div className={classnames('oj-filter-button', {'oj-filtered': post.oj_filtered})}
                         onClick={onOjFilterClick}>
                    </div>
                </div>
                <div className="pin">
                    {post.pin_count && post.pin_count > 0 ? post.pin_count : ''}
                    <div className={classnames('pinButton', {pinned})} onClick={onPinClick}>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: IPostTopBarProps) => {
    return {
        onBackClick: () => {
            window.history.back();
        },
        onOjFilterClick: () => {
            dispatch(ojFilterPost(ownProps.post.post_id, !ownProps.post.oj_filtered));
        },
        onPinClick: () => {
            const isPinned = ownProps.post.pinned && ownProps.post.pinned;
            dispatch(pin(ownProps.post.post_id, !isPinned));
        },
        onShareClick: () => {
            dispatch(sharePost(ownProps.post.post_id));
        },
    };
};

export const PostTopBar = connect(mapStateToProps, mapDispatchToProps)(PostTopBarComponent);
