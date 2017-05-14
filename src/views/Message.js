'use strict';

import React, {Component} from "react";
import PropTypes from 'prop-types';

export default class Message extends Component {
    static propTypes = {
        message: PropTypes.string.isRequired,
        onAtClick: PropTypes.func,
        onHashtagClick: PropTypes.func,
    };

    render() {
        const {message, onAtClick, onHashtagClick, ...forwardProps} = this.props;
        let linkReg = /([^#@]*)([@#])([^\s#@]*)/mg;
        let previousIndex = 0;
        let messageParts = [];
        while (true) {
            let regResult = linkReg.exec(message);
            if (regResult == null) {
                messageParts.push(message.substring(previousIndex));
                break;
            }
            messageParts.push(regResult[1]);
            if (regResult[2] == "@") {
                let channel = regResult[3];
                messageParts.push(<a className="hashtag"
                                     onClick={(e) => onAtClick(e, channel)}>@{channel}</a>);
            } else if (regResult[2] == "#") {
                let hashtag = regResult[3];
                messageParts.push(<a className="hashtag"
                                     onClick={(e) => onHashtagClick(e, hashtag)}>#{hashtag}</a>);
            }
            previousIndex = linkReg.lastIndex;
        }
        return (
            <div className="postMessage">{messageParts}</div>
        );
    }
};