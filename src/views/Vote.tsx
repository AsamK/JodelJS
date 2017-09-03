import * as classnames from 'classnames';
import * as React from 'react';
import {Component, MouseEvent} from 'react';

export interface VoteProps {
    vote_count: number;
    voted: string;
    upvote: (e: MouseEvent<HTMLElement>) => void;
    downvote: (e: MouseEvent<HTMLElement>) => void;
}

export default class Vote extends Component<VoteProps> {
    public render() {
        const {vote_count, voted, upvote, downvote} = this.props;
        return (
            <div className="vote">
                <div className={classnames('upVote', voted)} title="Up" onClick={upvote}/>
                <div className="voteCount">{vote_count}</div>
                <div className={classnames('downVote', voted)} title="Down" onClick={downvote}/>
            </div>
        );
    }
}
