import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';
import {IChannel} from '../interfaces/IChannel';

export interface ChannelListProps {
    channels: IChannel[]
    recommendedChannels: IChannel[]
    localChannels: IChannel[]
    onChannelClick: (channelName: string) => void
}

export default class ChannelList extends Component<ChannelListProps> {
    render() {
        const {channels, recommendedChannels, localChannels, onChannelClick} = this.props;
        const channelNodes = channels.map((channel) => {
                return ChannelList.createChannelNode(channel, onChannelClick);
            },
        );
        const recommendedChannelNodes = recommendedChannels.map((channel) => {
                return ChannelList.createChannelNode(channel, onChannelClick);
            },
        );
        const localChannelNodes = localChannels.map((channel) => {
                return ChannelList.createChannelNode(channel, onChannelClick);
            },
        );
        return (
            <div className="channelList">
                <div className="channelListHeader">Kanäle(beta)</div>
                {channelNodes}
                {recommendedChannelNodes.length > 0 ?
                    <div className="channelListRecommended">Vorschläge</div>
                    : undefined
                }
                {recommendedChannelNodes}
                {localChannelNodes.length > 0 ?
                    <div className="channelListLocal">Lokale</div>
                    : undefined
                }
                {localChannelNodes}
            </div>
        );
    }

    static createChannelNode(channel: IChannel, onChannelClick: (channel: string) => void) {
        return <div key={channel.channel}
                    className={classnames('channelLink', {unread: channel.unread})}
                    onClick={() => onChannelClick(channel.channel)}>
            {channel.image_url && channel.image_url != null ?
                <div className="channelPicture"
                     style={{backgroundImage: 'url(https:' + channel.image_url + ')'}}/>
                : undefined}
            <div className="title">@{channel.channel}</div>
            {channel.sponsored && channel.sponsored ?
                <div> (Sponsored)</div>
                : undefined}
            {channel.followers ?
                <div className="followers">{channel.followers} Followers</div>
                : undefined}
        </div>;
    }
};
