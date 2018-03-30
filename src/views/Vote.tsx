import classnames from 'classnames';
import React from 'react';

import {VoteType} from '../enums/VoteType';

export interface IVoteProps {
    vote_count: number;
    voted: VoteType;
    upvote: (e: React.MouseEvent<HTMLElement>) => void;
    downvote: (e: React.MouseEvent<HTMLElement>) => void;
}

interface IVoteState {
    justDownVoted: boolean;
    justUpVoted: boolean;
}

export default class Vote extends React.Component<IVoteProps, IVoteState> {
    public state = {
        justDownVoted: false,
        justUpVoted: false,
    };

    public render() {
        const {vote_count, voted, upvote, downvote} = this.props;
        const {justUpVoted, justDownVoted} = this.state;
        return (
            <div className="vote">
                <div className={classnames('upVote', voted, {justVoted: justUpVoted})} title="Up" onClick={e => {
                    this.setState({justUpVoted: true});
                    upvote(e);
                }}/>
                <div className="voteCount">{vote_count}</div>
                <div className={classnames('downVote', voted, {justVoted: justDownVoted})} title="Down" onClick={e => {
                    this.setState({justDownVoted: true});
                    downvote(e);
                }}/>
            </div>
        );
    }
}
