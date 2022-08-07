import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import type { IPost } from '../interfaces/IPost';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { pin } from '../redux/actions';
import { ojFilterPost, sharePost } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';
import { selectedPostSelector } from '../redux/selectors/posts';

import BackButton from './BackButton';
import './PostTopBar.scss';

export interface IPostTopBarProps {}

export interface IPostTopBarStateProps extends IPostTopBarProps {
    post: IPost | null;
}

export interface IPostTopBarComponentProps extends IPostTopBarStateProps {
    onBackClick: () => void;
    onPinClick: () => void;
    onShareClick: () => void;
    onOjFilterClick: () => void;
}

const PostTopBarComponent = (props: IPostTopBarComponentProps) => {
    const { onBackClick, onOjFilterClick, onPinClick, onShareClick, post } = props;
    if (!post) {
        return null;
    }
    const pinned = post.pinned && post.pinned;
    return (
        <div className="post-top-bar">
            <BackButton onClick={onBackClick} />
            <div className="right-buttons">
                {post.shareable && post.shareable ? (
                    <div className="share">
                        {post.share_count && post.share_count > 0 ? post.share_count : ''}
                        <div className="share-button" onClick={onShareClick}></div>
                    </div>
                ) : (
                    ''
                )}
                <div className="oj-filter">
                    <div
                        className={classnames('oj-filter-button', {
                            'oj-filtered': post.oj_filtered,
                        })}
                        onClick={onOjFilterClick}
                    ></div>
                </div>
                <div className="pin">
                    {post.pin_count && post.pin_count > 0 ? post.pin_count : ''}
                    <div
                        className={classnames('pin-button', { pinned })}
                        onClick={onPinClick}
                    ></div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        post: selectedPostSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch, ownProps: IPostTopBarStateProps) => {
    return {
        onBackClick: () => {
            window.history.back();
        },
        onOjFilterClick: () => {
            if (!ownProps.post) {
                return;
            }
            dispatch(ojFilterPost(ownProps.post.post_id, !ownProps.post.oj_filtered));
        },
        onPinClick: () => {
            if (!ownProps.post) {
                return;
            }
            const isPinned = ownProps.post.pinned && ownProps.post.pinned;
            dispatch(pin(ownProps.post.post_id, !isPinned));
        },
        onShareClick: () => {
            if (!ownProps.post) {
                return;
            }
            dispatch(sharePost(ownProps.post.post_id));
        },
    };
};

export const PostTopBar = connect(mapStateToProps)(
    connect(() => ({}), mapDispatchToProps)(PostTopBarComponent),
);
