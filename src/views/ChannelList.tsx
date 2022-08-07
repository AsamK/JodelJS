import React from 'react';
import { connect } from 'react-redux';

import type { IChannel } from '../interfaces/IChannel';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { switchPostSection } from '../redux/actions';
import type { IJodelAppStore } from '../redux/reducers';
import {
    countryChannelsSelector,
    followedChannelsSelector,
    localChannelsSelector,
    recommendedChannelsSelector,
} from '../redux/selectors/channels';

import './ChannelList.scss';
import { ChannelListItem } from './ChannelListItem';

interface IChannelListComponentProps {
    channels: IChannel[];
    recommendedChannels: IChannel[];
    localChannels: IChannel[];
    countryChannels: IChannel[];
    onChannelClick: (channelName: string) => void;
}

interface IChannelListComponentState {
    channelFilter: string;
    showLocalChannels: boolean;
    showCountryChannels: boolean;
}

export class ChannelListComponent extends React.Component<
    IChannelListComponentProps,
    IChannelListComponentState
> {
    private static lastScrollPosition = 0;

    public state: IChannelListComponentState = {
        channelFilter: '',
        showCountryChannels: false,
        showLocalChannels: false,
    };

    private scrollable = React.createRef<HTMLDivElement>();

    public componentDidMount(): void {
        if (this.scrollable.current) {
            this.scrollable.current.scrollTop = ChannelListComponent.lastScrollPosition;
        }
    }

    public componentWillUnmount(): void {
        if (this.scrollable.current) {
            ChannelListComponent.lastScrollPosition = this.scrollable.current.scrollTop;
        }
    }

    public render(): React.ReactElement | null {
        const { channels, recommendedChannels, localChannels, countryChannels, onChannelClick } =
            this.props;
        const channelNodes = channels.map(channel => {
            return this.createChannelNode(channel, onChannelClick, true);
        });
        const recommendedChannelNodes = recommendedChannels.map(channel => {
            return this.createChannelNode(channel, onChannelClick, true);
        });
        const localChannelNodes = !this.state.showLocalChannels
            ? null
            : localChannels.map(channel => {
                  return this.createChannelNode(channel, onChannelClick, false);
              });
        const countryChannelNodes = !this.state.showCountryChannels
            ? null
            : countryChannels.map(channel => {
                  return this.createChannelNode(channel, onChannelClick, false);
              });
        return (
            <div className="channel-list" ref={this.scrollable}>
                <div className="channel-list_header">Kanäle(beta)</div>
                <div className="channel-list_filter">
                    <input
                        type="text"
                        placeholder="Channel filtern"
                        value={this.state.channelFilter}
                        onChange={this.onFilterChange}
                    />
                    {!this.state.channelFilter ? null : (
                        <ChannelListItem
                            key={this.state.channelFilter}
                            channel={{ unread: false, channel: this.state.channelFilter }}
                            onChannelClick={onChannelClick}
                            showImage={false}
                        />
                    )}
                </div>
                {channelNodes}
                {recommendedChannelNodes.length === 0 ? null : (
                    <div className="channel-list_recommended">
                        Vorschläge
                        <div className="channel-count">{recommendedChannels.length}</div>
                    </div>
                )}
                {recommendedChannelNodes}
                {localChannels.length === 0 ? null : (
                    <div className="channel-list_local" onClick={this.onToggleLocalChannels}>
                        Lokale
                        <div className="channel-count">{localChannels.length}</div>
                    </div>
                )}
                {localChannelNodes}
                {countryChannels.length === 0 ? null : (
                    <div className="channel-list_country" onClick={this.onToggleCountryChannels}>
                        Landesweit
                        <div className="channel-count">{countryChannels.length}</div>
                    </div>
                )}
                {countryChannelNodes}
            </div>
        );
    }

    private createChannelNode(
        channel: IChannel,
        onChannelClick: (channel: string) => void,
        showImage: boolean,
    ): React.ReactElement | null {
        if (
            this.state.channelFilter &&
            !channel.channel.toLowerCase().includes(this.state.channelFilter.toLowerCase())
        ) {
            return null;
        }
        return (
            <ChannelListItem
                key={channel.channel}
                channel={channel}
                onChannelClick={onChannelClick}
                showImage={showImage}
            />
        );
    }

    private onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ channelFilter: e.target.value });
    };

    private onToggleLocalChannels = () => {
        this.setState({ showLocalChannels: !this.state.showLocalChannels });
    };

    private onToggleCountryChannels = () => {
        this.setState({ showCountryChannels: !this.state.showCountryChannels });
    };
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        channels: followedChannelsSelector(state),
        countryChannels: countryChannelsSelector(state),
        localChannels: localChannelsSelector(state),
        recommendedChannels: recommendedChannelsSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        onChannelClick(channelName: string): void {
            dispatch(switchPostSection('channel:' + channelName));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelListComponent);
