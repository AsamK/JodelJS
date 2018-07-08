import React from 'react';

import {IChannel} from '../interfaces/IChannel';
import {ChannelListItem} from './ChannelListItem';

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

export default class ChannelList extends React.Component<IChannelListProps, IChannelListState> {
    private static lastScrollPosition = 0;

    public state: IChannelListState = {channelFilter: ''};

    private scrollable: HTMLElement | undefined;

    public componentWillUnmount() {
        if (this.scrollable) {
            ChannelList.lastScrollPosition = this.scrollable.scrollTop;
        }
    }

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
            <div className="channelList" ref={this.channelListRef}>
                <div className="channelListHeader">Kanäle(beta)</div>
                <div className="channelFilter">
                    <input type="text"
                           className="channelFilterText"
                           placeholder="Channel filtern"
                           value={this.state.channelFilter}
                           onChange={this.onFilterChange}
                    />
                    {!this.state.channelFilter ? null :
                        <div
                            className="channelLink"
                            onClick={this.onNewChannelClick}>
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
        return <ChannelListItem
            key={channel.channel}
            channel={channel}
            onChannelClick={onChannelClick}
            showImage={showImage}
        />;
    }

    private onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({channelFilter: e.target.value});
    }

    private onNewChannelClick = () => {
        this.props.onChannelClick(this.state.channelFilter);
    }

    private channelListRef = (element: HTMLDivElement) => {
        this.scrollable = element;
        if (this.scrollable) {
            this.scrollable.scrollTop = ChannelList.lastScrollPosition;
        }
    }
}
