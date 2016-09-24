'use strict';

import React, {Component} from "react";

export default class Message extends Component {
    static propTypes = {
        message: React.PropTypes.string.isRequired,
        onHashtagClick: React.PropTypes.func,
    };

    render() {
        const {message, onHashtagClick, ...forwardProps} = this.props;
        let hashReg = /([^@]*)@([^\s@]*)/mg;
        let previousIndex = 0;
        let messageParts = [];
        while (true) {
            let regResult = hashReg.exec(message);
            if (regResult == null) {
                messageParts.push(message.substring(previousIndex));
                break;
            }
            messageParts.push(regResult[1]);
            let hashtag = regResult[2];
            messageParts.push(<a className="hashtag"
                                 onClick={(e) => onHashtagClick(e, hashtag)}>@{hashtag}</a>);
            previousIndex = hashReg.lastIndex;
        }
        return (
            <div className="postMessage">{messageParts}</div>
        );
    }
};