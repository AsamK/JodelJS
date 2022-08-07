import classnames from 'classnames';
import React from 'react';

import type { IChannel } from '../interfaces/IChannel';
import './ChannelListItem.scss';

export class ChannelListItem
    extends React.PureComponent<{ channel: IChannel; onChannelClick: (channel: string) => void; showImage: boolean }> {

    public render(): React.ReactElement | null {
        const { channel, showImage } = this.props;
        return <div
            className={classnames('channel-list-item', { unread: channel.unread })}
            onClick={this.onChannelClick}>
            {showImage && channel.image_url ?
                <div className="channel-list-item_picture"
                    style={{ backgroundImage: 'url(https:' + channel.image_url + ')' }} />
                : undefined}
            <div className="channel-list-item_title">@{channel.channel}</div>
            <div className="channel-list-item_info">
                {channel.sponsored ?
                    <div className="channel-list-item_info-sponsored"> (Sponsored)</div>
                    : undefined}
                {channel.followers ?
                    <div className="channel-list-item_info-followers">{channel.followers} Followers</div>
                    : undefined}
                {channel.country_followers ?
                    <div className="channel-list-item_info-country-followers">
                        {channel.country_followers} Country wide
                    </div>
                    : undefined}
            </div>
        </div>;
    }

    private onChannelClick = () => {
        this.props.onChannelClick(this.props.channel.channel);
    };
}
