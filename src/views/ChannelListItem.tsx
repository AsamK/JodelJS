import classnames from 'classnames';
import React from 'react';

import {IChannel} from '../interfaces/IChannel';

export class ChannelListItem
    extends React.PureComponent<{ channel: IChannel, onChannelClick: (channel: string) => void, showImage: boolean }> {

    public render() {
        const {channel, showImage} = this.props;
        return <div
            className={classnames('channelLink', {unread: channel.unread})}
            onClick={this.onChannelClick}>
            {showImage && channel.image_url ?
                <div className="channelPicture"
                     style={{backgroundImage: 'url(https:' + channel.image_url + ')'}}/>
                : undefined}
            <div className="title">@{channel.channel}</div>
            <div className="channel-info">
                {channel.sponsored ?
                    <div className="sponsored"> (Sponsored)</div>
                    : undefined}
                {channel.followers ?
                    <div className="followers">{channel.followers} Followers</div>
                    : undefined}
                {channel.country_followers ?
                    <div className="countryFollowers">{channel.country_followers} Country wide</div>
                    : undefined}
            </div>
        </div>;
    }

    private onChannelClick = () => {
        this.props.onChannelClick(this.props.channel.channel);
    }
}
