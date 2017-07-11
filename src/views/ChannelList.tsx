import * as classnames from 'classnames';
import * as Immutable from 'immutable';
import * as React from 'react';
import {Component} from 'react';

export interface ChannelListProps {
    channels: Immutable.List<any>
    recommendedChannels: Immutable.List<any>
    localChannels: Immutable.List<any>
    onChannelClick: (channelName: string) => void
}

export default class ChannelList extends Component<ChannelListProps> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
    }

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
                {recommendedChannelNodes.size > 0 ?
                    <div className="channelListRecommended">Vorschläge</div>
                    : undefined
                }
                {recommendedChannelNodes}
                {localChannelNodes.size > 0 ?
                    <div className="channelListLocal">Lokale</div>
                    : undefined
                }
                {localChannelNodes}
            </div>
        );
    }

    static createChannelNode(channel, onChannelClick) {
        return <div key={channel.get('channel')}
                    className={classnames('channelLink', {unread: channel.get('unread')})}
                    onClick={() => onChannelClick(channel.get('channel'))}>
            {channel.has('image_url') && channel.get('image_url') != null ?
                <div className="channelPicture"
                     style={{backgroundImage: 'url(https:' + channel.get('image_url') + ')'}}/>
                : undefined}
            <div className="title">@{channel.get('channel')}</div>
            {channel.has('sponsored') && channel.get('sponsored') ?
                <div> (Sponsored)</div>
                : undefined}
            {channel.has('followers') ?
                <div className="followers">{channel.get('followers')} Followers</div>
                : undefined}
        </div>;
    }
};
