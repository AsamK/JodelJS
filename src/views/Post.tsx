import * as classnames from 'classnames';
import * as React from 'react';
import {MouseEvent, PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';

import {IPost} from '../interfaces/IPost';
import {deletePost, downVote, giveThanks, selectPicture, switchPostSection, upVote} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import ChildInfo from './ChildInfo';
import Location from './Location';
import Message from './Message';
import Time from './Time';
import Vote from './Vote';

export interface PostProps {
    post: IPost
    parentPostId?: string
    author?: string
    onPostClick: () => void
}

interface PostComponentProps extends PostProps {
    selectPicture: () => void
    deletePost: () => void
    downVote: () => void
    upVote: () => void
    giveThanks: () => void
    switchToHashtag: (hashtag: string) => void
    switchToChannel: (channel: string) => void
}

export class PostComponent extends PureComponent<PostComponentProps> {
    private pressTimer: number;

    constructor(props: PostComponentProps) {
        super(props);
    }

    private upvote = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        const {post, parentPostId} = this.props;
        if (post.voted === 'up') {
            // Already upvoted -> Give thanks
            this.props.giveThanks();
        } else {
            this.props.upVote();
        }
    };

    private downvote = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        this.props.downVote();
    };

    render() {
        const {post, author, onPostClick} = this.props;
        return (
            <div className="post" style={{backgroundColor: '#' + post.color}} onClick={onPostClick}>
                {post.thumbnail_url ?
                    <div className="postPicture"
                         style={{backgroundImage: 'url(https:' + post.thumbnail_url + ')'}}
                         onMouseUp={e => clearTimeout(this.pressTimer)}
                         onContextMenu={e => {
                             e.preventDefault();
                             clearTimeout(this.pressTimer);
                             this.props.selectPicture();
                         }}
                         onMouseDown={e => {
                             clearTimeout(this.pressTimer);
                             this.pressTimer = window.setTimeout(() => this.props.selectPicture(), 300);
                         }}/>
                    :
                    <Message message={post.message} onAtClick={(e, channel) => {
                        e.stopPropagation();
                        this.props.switchToChannel(channel);
                    }} onHashtagClick={(e, hashtag) => {
                        e.stopPropagation();
                        this.props.switchToHashtag(hashtag);
                    }}/>
                }
                <Vote vote_count={post.vote_count} voted={post.voted ? post.voted : ''}
                      upvote={this.upvote} downvote={this.downvote}/>
                <Time time={post.created_at}/>
                <ChildInfo child_count={post.child_count ? post.child_count : 0}/>
                <Location location={post.location.name} distance={post.distance}
                          fromHome={post.from_home}/>
                <div className="author">
                    {author ?
                        <div className={classnames(author, {gotThanks: post.got_thanks})}>
                            {author}
                        </div>
                        : ''}
                </div>
                {post.post_own === 'own' ? <a onClick={e => {
                    e.stopPropagation();
                    this.props.deletePost();
                }}>delete</a> : ''}
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: PostProps) => {
    return {
        selectPicture: () => dispatch(selectPicture(ownProps.post.post_id)),
        deletePost: () => dispatch(deletePost(ownProps.post.post_id)),
        downVote: () => dispatch(downVote(ownProps.post.post_id)),
        upVote: () => dispatch(upVote(ownProps.post.post_id)),
        giveThanks: () => dispatch(giveThanks(ownProps.post.post_id, ownProps.parentPostId)),
        switchToHashtag: (hashtag: string) => dispatch(switchPostSection('hashtag:' + hashtag)),
        switchToChannel: (channel: string) => dispatch(switchPostSection('channel:' + channel)),
    };
};

export const Post = connect(mapStateToProps, mapDispatchToProps)(PostComponent);
