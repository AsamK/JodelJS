import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { PostOwn } from '../enums/PostOwn';
import { UserHandle } from '../enums/UserHandle';
import { VoteType } from '../enums/VoteType';
import type { IPost } from '../interfaces/IPost';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { deletePost, downVote, giveThanks, pollVote, selectPicture, switchPostSection, upVote } from '../redux/actions';
import type { IJodelAppStore } from '../redux/reducers';

import ChildInfo from './ChildInfo';
import Location from './Location';
import Message from './Message';
import { Time } from './Time';
import Vote from './Vote';

export interface IPostProps {
    post: IPost;
    parentPostId?: string;
    author?: string;
    onPostClick: () => void;
}

interface IPostComponentProps extends IPostProps {
    selectPicture: () => void;
    deletePost: () => void;
    downVote: () => void;
    upVote: () => void;
    pollVote: (pollId: string, option: number) => void;
    giveThanks: () => void;
    switchToHashtag: (hashtag: string) => void;
    switchToChannel: (channel: string) => void;
}

export class PostComponent extends React.PureComponent<IPostComponentProps> {
    private pressTimer: number | undefined;

    constructor(props: IPostComponentProps) {
        super(props);
    }

    public render(): React.ReactElement | null {
        const { post, author, parentPostId, onPostClick } = this.props;
        return (
            <div className={classnames('post', {
                'collapse': post.collapse,
                'post-oj': !!parentPostId && post.user_handle === UserHandle.OJ,
            })}
                style={{ backgroundColor: '#' + post.color }}
                onClick={onPostClick}>
                {post.channel ? <div
                    className="channel-link"
                    onClick={e => {
                        if (!post.channel) {
                            return;
                        }
                        e.stopPropagation();
                        this.props.switchToChannel(post.channel);
                    }}
                >{post.channel}</div> : null}
                {post.thumbnail_url ?
                    <div className="postPicture"
                        style={{ backgroundImage: 'url(https:' + post.thumbnail_url + ')' }}
                        onMouseUp={() => {
                            if (this.pressTimer !== undefined) {
                                clearTimeout(this.pressTimer);
                            }
                        }}
                        onContextMenu={e => {
                            e.preventDefault();
                            if (this.pressTimer !== undefined) {
                                clearTimeout(this.pressTimer);
                            }
                            this.props.selectPicture();
                        }}
                        onMouseDown={() => {
                            if (this.pressTimer !== undefined) {
                                clearTimeout(this.pressTimer);
                            }
                            this.pressTimer = window.setTimeout(() => this.props.selectPicture(), 300);
                        }} />
                    :
                    <Message message={post.message} onAtClick={(e, channel) => {
                        e.stopPropagation();
                        this.props.switchToChannel(channel);
                    }} onHashtagClick={(e, hashtag) => {
                        e.stopPropagation();
                        this.props.switchToHashtag(hashtag);
                    }}
                        link={post.news_url ? { title: post.news_cta, url: post.news_url } : undefined}
                    />
                }
                <Vote vote_count={post.vote_count} voted={post.voted ? post.voted : VoteType.NOT_VOTED}
                    upvote={this.upvote} downvote={this.downvote} />
                <Time time={post.created_at} />
                <ChildInfo child_count={post.child_count ? post.child_count : 0} />
                <Location location={post.location.name} distance={post.distance}
                    fromHome={post.from_home || false} />
                <div className="author">
                    {author ?
                        <div className={classnames(author, { gotThanks: post.got_thanks })}>
                            {author}
                        </div>
                        : ''}
                </div>
                {post.post_own === PostOwn.OWN ? <a onClick={e => {
                    e.stopPropagation();
                    this.props.deletePost();
                }}>delete</a> : ''}
                {!post.poll_id ? null :
                    <div style={{ clear: 'both' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {post.poll_options
                            ?.map((option, i) => <label key={i}>
                                <input
                                    name={post.poll_id}
                                    type="radio"
                                    value={i}
                                    checked={i === post.poll_vote}
                                    onChange={() => this.props.pollVote(post.poll_id!, i)}
                                />
                                {option} ({post.poll_votes?.[i]})
                        </label>)}
                    </div>
                }
            </div>
        );
    }

    private upvote = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        const { post } = this.props;
        if (post.voted === 'up') {
            // Already upvoted -> Give thanks
            this.props.giveThanks();
        } else {
            this.props.upVote();
        }
    };

    private downvote = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        this.props.downVote();
    };
}

const mapStateToProps = (_state: IJodelAppStore) => {
    return {};
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch, ownProps: IPostProps) => {
    return {
        deletePost: () => dispatch(deletePost(ownProps.post.post_id)),
        downVote: () => dispatch(downVote(ownProps.post.post_id)),
        pollVote: (pollId: string, option: number) => dispatch(pollVote(ownProps.post.post_id, pollId, option)),
        giveThanks: () => dispatch(giveThanks(ownProps.post.post_id, ownProps.parentPostId)),
        selectPicture: () => dispatch(selectPicture(ownProps.post.post_id)),
        switchToChannel: (channel: string) => dispatch(switchPostSection('channel:' + channel)),
        switchToHashtag: (hashtag: string) => dispatch(switchPostSection('hashtag:' + hashtag)),
        upVote: () => dispatch(upVote(ownProps.post.post_id)),
    };
};

export const Post = connect(mapStateToProps, mapDispatchToProps)(PostComponent);
