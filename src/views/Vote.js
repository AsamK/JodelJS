'use strict';

import React, {Component} from "react";
import classnames from "classnames";
import PropTypes from 'prop-types';

export default class Vote extends Component {
    static propTypes = {
        vote_count: PropTypes.number.isRequired,
        voted: PropTypes.string.isRequired,
        upvote: PropTypes.func,
        downvote: PropTypes.func
    };

    render() {
        const {vote_count, voted, upvote, downvote, ...forwardProps} = this.props;
        return (
            <div className="vote">
                <div className={classnames("upVote", voted)} title="Up" onClick={upvote}/>
                <div className="voteCount">{vote_count}</div>
                <div className={classnames("downVote", voted)} title="Down" onClick={downvote}/>
            </div>
        );
    }
};