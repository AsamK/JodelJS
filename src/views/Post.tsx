import * as classnames from 'classnames';
import * as React from 'react';
import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {deletePost, downVote, giveThanks, selectPicture, switchPostSection, upVote} from '../redux/actions';
import ChildInfo from './ChildInfo';
import Location from './Location';
import Message from './Message';
import Time from './Time';
import Vote from './Vote';
import {IPost} from '../interfaces/IPost';

export interface PostProps {
    post: IPost
    parentPostId: string
    author: string
    onPostClick: () => void
    dispatch: any
}

class Post extends PureComponent<PostProps> {
    private pressTimer: number;

    constructor(props) {
        super(props);
        this.upvote = this.upvote.bind(this);
        this.downvote = this.downvote.bind(this);
    }

    upvote(e) {
        e.stopPropagation();
        const {dispatch, post, parentPostId} = this.props;
        if (post.voted === 'up') {
            // Give thanks
            dispatch(giveThanks(post.post_id, parentPostId));
        } else {
            dispatch(upVote(post.post_id));
        }
    }

    downvote(e) {
        e.stopPropagation();
        this.props.dispatch(downVote(this.props.post.post_id));
    }

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
                             this.props.dispatch(selectPicture(post.post_id));
                         }}
                         onMouseDown={e => {
                             clearTimeout(this.pressTimer);
                             this.pressTimer = window.setTimeout(() => this.props.dispatch(selectPicture(post.post_id)), 300);
                         }}/>
                    :
                    <Message message={post.message} onAtClick={(e, channel) => {
                        e.stopPropagation();
                        this.props.dispatch(switchPostSection('channel:' + channel));
                    }} onHashtagClick={(e, hashtag) => {
                        e.stopPropagation();
                        this.props.dispatch(switchPostSection('hashtag:' + hashtag));
                    }}/>
                }
                <Vote vote_count={post.vote_count} voted={post.voted ? post.voted : ''}
                      upvote={this.upvote} downvote={this.downvote}/>
                <Time time={post.created_at}/>
                <ChildInfo child_count={post.child_count ? post.child_count : 0}/>
                <Location location={post.location.name} distance={post.distance}
                          fromHome={post.from_home}/>
                <div className="author">
                    {author != undefined ?
                        <div className={classnames(author, {gotThanks: post.got_thanks})}>
                            {author}
                        </div>
                        : ''}
                </div>
                {post.post_own === 'own' ? <a onClick={e => {
                    e.stopPropagation();
                    this.props.dispatch(deletePost(post.post_id));
                }}>delete</a> : ''}
            </div>
        );
    }
}

export default connect()(Post);
