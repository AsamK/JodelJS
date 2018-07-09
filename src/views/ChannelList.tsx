import React from 'react';
import {connect} from 'react-redux';

import {IChannel} from '../interfaces/IChannel';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {
    getCountryChannels,
    getFollowedChannels,
    getLocalChannels,
    getRecommendedChannels,
} from '../redux/selectors/channels';
import {ChannelListItem} from './ChannelListItem';

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

export class ChannelListComponent extends React.Component<IChannelListComponentProps, IChannelListComponentState> {
    private static lastScrollPosition = 0;

    public state: IChannelListComponentState = {
        channelFilter: '',
        showCountryChannels: false,
        showLocalChannels: false,
    };

    private scrollable: HTMLElement | undefined;

    public componentWillUnmount() {
        if (this.scrollable) {
            ChannelListComponent.lastScrollPosition = this.scrollable.scrollTop;
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
        const localChannelNodes = !this.state.showLocalChannels ? null : localChannels.map(channel => {
                return this.createChannelNode(channel, onChannelClick, false);
            },
        );
        const countryChannelNodes = !this.state.showCountryChannels ? null : countryChannels.map(channel => {
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
                {recommendedChannelNodes.length === 0 ? null :
                    <div className="channelListRecommended">
                        Vorschläge
                        <div className="channelCount">{recommendedChannels.length}</div>
                    </div>
                }
                {recommendedChannelNodes}
                {localChannels.length === 0 ? null :
                    <div className="channelListLocal" onClick={this.onToggleLocalChannels}>
                        Lokale
                        <div className="channelCount">{localChannels.length}</div>
                    </div>
                }
                {localChannelNodes}
                {countryChannels.length === 0 ? null :
                    <div className="channelListCountry" onClick={this.onToggleCountryChannels}>
                        Landesweit
                        <div className="channelCount">{countryChannels.length}</div>
                    </div>
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
    };

    private onToggleLocalChannels = (e: React.MouseEvent<HTMLDivElement>) => {
        this.setState({showLocalChannels: !this.state.showLocalChannels});
    };

    private onToggleCountryChannels = (e: React.MouseEvent<HTMLDivElement>) => {
        this.setState({showCountryChannels: !this.state.showCountryChannels});
    };

    private onNewChannelClick = () => {
        this.props.onChannelClick(this.state.channelFilter);
    };

    private channelListRef = (element: HTMLDivElement) => {
        this.scrollable = element;
        if (this.scrollable) {
            this.scrollable.scrollTop = ChannelListComponent.lastScrollPosition;
        }
    };
}

const mapStateToProps = (state: IJodelAppStore, ownProps: {}) => {
    return {
        channels: getFollowedChannels(state),
        countryChannels: getCountryChannels(state),
        localChannels: getLocalChannels(state),
        recommendedChannels: getRecommendedChannels(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch, ownProps: {}) => {
    return {
        onChannelClick(channelName: string) {
            dispatch(switchPostSection('channel:' + channelName));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelListComponent);
