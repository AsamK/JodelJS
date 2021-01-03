import classnames from 'classnames';
import React from 'react';

import { VoteType } from '../enums/VoteType';
import './Vote.scss';

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

    public render(): React.ReactElement | null {
        const { vote_count, voted, upvote, downvote } = this.props;
        const { justUpVoted, justDownVoted } = this.state;
        return (
            <div className="post-vote">
                <div
                    className={classnames('post-vote_up-vote',
                        'post-vote_' + voted,
                        { 'post-vote_just-voted': justUpVoted },
                    )}
                    title="Up"
                    onClick={e => {
                        this.setState({ justUpVoted: true });
                        upvote(e);
                    }}
                />
                <div className="post-vote_count">{vote_count}</div>
                <div
                    className={classnames('post-vote_down-vote',
                        'post-vote_' + voted,
                        { 'post-vote_just-voted': justDownVoted },
                    )}
                    title="Down"
                    onClick={e => {
                        this.setState({ justDownVoted: true });
                        downvote(e);
                    }}
                />
            </div>
        );
    }
}
