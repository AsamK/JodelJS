import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';
import {IChannel} from '../interfaces/IChannel';

export interface IChannelListProps {
    channels: IChannel[];
    recommendedChannels: IChannel[];
    localChannels: IChannel[];
    countryChannels: IChannel[];
    onChannelClick: (channelName: string) => void;
}

export interface IChannelListState {
    channelFilter: string;
}

export default class ChannelList extends Component<IChannelListProps, IChannelListState> {
    public state: IChannelListState = {channelFilter: ''};

    public render() {
        const {channels, recommendedChannels, localChannels, countryChannels, onChannelClick} = this.props;
        const channelNodes = channels.map(channel => {
                return this.createChannelNode(channel, onChannelClick, true);
            },
        );
        const recommendedChannelNodes = recommendedChannels.map(channel => {
                return this.createChannelNode(channel, onChannelClick, true);
            },
        );
        const localChannelNodes = localChannels.map(channel => {
                return this.createChannelNode(channel, onChannelClick, false);
            },
        );
        const countryChannelNodes = countryChannels.map(channel => {
                return this.createChannelNode(channel, onChannelClick, false);
            },
        );
        return (
            <div className="channelList">
                <div className="channelListHeader">Kanäle(beta)</div>
                <div className="channelFilter">
                    <input type="text"
                           className="channelFilterText"
                           placeholder="Channel filtern"
                           value={this.state.channelFilter}
                           onChange={e => this.setState({channelFilter: e.target.value})}
                    />
                    {!this.state.channelFilter ? null :
                        <div
                            className="channelLink"
                            onClick={() => onChannelClick(this.state.channelFilter)}>
                            <div className="title">@{this.state.channelFilter}</div>
                        </div>
                    }
                </div>
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
                {countryChannelNodes.length > 0 ?
                    <div className="channelListCountry">Landesweit</div>
                    : undefined
                }
                {countryChannelNodes}
            </div>
        );
    }

    private createChannelNode(channel: IChannel, onChannelClick: (channel: string) => void, showImage: boolean) {
        if (this.state.channelFilter &&
            !channel.channel.toLowerCase().includes(this.state.channelFilter.toLowerCase())) {
            return;
        }
        return <div key={channel.channel}
                    className={classnames('channelLink', {unread: channel.unread})}
                    onClick={() => onChannelClick(channel.channel)}>
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
}
