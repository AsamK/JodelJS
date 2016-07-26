'use strict';

import React, {Component} from "react";
import classnames from 'classnames';

export default class Vote extends Component {
    static propTypes = {
        vote_count: React.PropTypes.number.isRequired,
        voted: React.PropTypes.string.isRequired,
        upvote: React.PropTypes.func,
        downvote: React.PropTypes.func
    };

    render() {
        const {vote_count, voted, upvote, downvote, ...forwardProps} = this.props;
        return (
            <div className="vote">
                <div className={classnames("upVote", voted)} onClick={upvote}/>
                <div className="voteCount">{vote_count}</div>
                <div className={classnames("downVote", voted)} onClick={downvote}/>
            </div>
        );
    }
};