import * as React from 'react';
import {PureComponent} from 'react';

import {IApiSticky} from '../interfaces/IApiSticky';
import Message from './Message';

export interface IStickyProps {
    sticky: IApiSticky;
    onCloseClick: () => void;
    onLinkClick: (link: string) => void;
    onButtonClick: (title: string) => void;
    switchToHashtag: (hashtag: string) => void;
    switchToChannel: (channel: string) => void;
}

export class Sticky extends PureComponent<IStickyProps> {
    constructor(props: IStickyProps) {
        super(props);
    }

    public render() {
        const {sticky, onCloseClick, onLinkClick, onButtonClick, switchToChannel, switchToHashtag} = this.props;
        const stickyLink = sticky.link;
        const stickyButtons = sticky.buttons;
        return (
            <div className="sticky" style={{backgroundColor: '#' + sticky.color}}>
                <button type="button" onClick={onCloseClick}>X</button>
                <Message message={sticky.message} onAtClick={(e, channel) => {
                    e.stopPropagation();
                    switchToChannel(channel);
                }} onHashtagClick={(e, hashtag) => {
                    e.stopPropagation();
                    switchToHashtag(hashtag);
                }}/>
                {
                    stickyLink ?
                        <a className="stickLink" onClick={() => onLinkClick(stickyLink)}>Linked Post</a>
                        : undefined
                }
                {
                    stickyButtons ?
                        <div className="stickButtons">
                            {
                                stickyButtons.map(button => <button type="button" onClick={() => onButtonClick(
                                    button.title)}>{button.title}</button>)
                            }
                        </div>
                        : undefined
                }
                <div className="location">
                    {sticky.location_name}
                </div>
            </div>
        );
    }
}
