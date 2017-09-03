import * as React from 'react';
import {Component, MouseEvent} from 'react';

export interface MessageProps {
    message: string;
    onAtClick: (e: MouseEvent<HTMLElement>, channel: string) => void;
    onHashtagClick: (e: MouseEvent<HTMLElement>, channel: string) => void;
}

export default class Message extends Component<MessageProps> {
    public render() {
        const {message, onAtClick, onHashtagClick} = this.props;
        const linkReg = /([^#@]*)([@#])([^\s#@]*)/mg;
        let previousIndex = 0;
        const messageParts = [];
        while (true) {
            const regResult = linkReg.exec(message);
            if (regResult == null) {
                messageParts.push(message.substring(previousIndex));
                break;
            }
            messageParts.push(regResult[1]);
            if (regResult[2] == '@') {
                const channel = regResult[3];
                messageParts.push(<a key={linkReg.lastIndex} className="hashtag"
                                     onClick={e => onAtClick(e, channel)}>@{channel}</a>);
            } else if (regResult[2] == '#') {
                const hashtag = regResult[3];
                messageParts.push(<a key={linkReg.lastIndex} className="hashtag"
                                     onClick={e => onHashtagClick(e, hashtag)}>#{hashtag}</a>);
            }
            previousIndex = linkReg.lastIndex;
        }
        return (
            <div className="postMessage">{messageParts}</div>
        );
    }
}
