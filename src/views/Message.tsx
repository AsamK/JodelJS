import React from 'react';

export interface IMessageProps {
    message: string;
    link?: { url: string; title?: string };
    onAtClick: (e: React.MouseEvent<HTMLElement>, channel: string) => void;
    onHashtagClick: (e: React.MouseEvent<HTMLElement>, channel: string) => void;
}

export default class Message extends React.Component<IMessageProps> {
    public render(): React.ReactElement | null {
        const { message, link, onAtClick, onHashtagClick } = this.props;
        const linkReg = /([^#@]*)([@#])([^\s#@:;.,]*)|([^[]*)\[([^[\]]*)\]\(([^()]*)\)/mg;
        let previousIndex = 0;
        const messageParts = [];
        while (true) {
            const regResult = linkReg.exec(message);

            if (regResult === null) {
                messageParts.push(message.substring(previousIndex));
                break;
            }
            if (regResult[1] !== undefined) {
                messageParts.push(regResult[1]);
                if (regResult[2] === '@') {
                    const channel = regResult[3];
                    messageParts.push(<a key={linkReg.lastIndex} className="channel-link"
                        onClick={e => onAtClick(e, channel)}>@{channel}</a>);
                } else if (regResult[2] === '#') {
                    const hashtag = regResult[3];
                    messageParts.push(<a key={linkReg.lastIndex} className="hashtag"
                        onClick={e => onHashtagClick(e, hashtag)}>#{hashtag}</a>);
                }
            } else if (regResult[4] !== undefined) {
                messageParts.push(regResult[4]);
                const linkLabel = regResult[5];
                const linkTarget = regResult[6];
                messageParts.push(
                    <a className="sticky-link"
                        key={linkLabel + linkTarget}
                        href={linkTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {linkLabel}
                    </a>,
                );
            }
            previousIndex = linkReg.lastIndex;
        }

        return (
            <div className="postMessage">
                {messageParts}
                {link
                    ? <div>{link.title}: <a href={link.url}>{link.url}</a></div>
                    : null}
            </div>
        );
    }
}
