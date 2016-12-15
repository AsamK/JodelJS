'use strict';

import React, {Component} from "react";
import classnames from "classnames";

export default class ChannelList extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        channels: React.PropTypes.array.isRequired,
        recommendedChannels: React.PropTypes.array.isRequired,
        localChannels: React.PropTypes.array.isRequired,
        onChannelClick: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
    }

    render() {
        const {channels, recommendedChannels, localChannels, onChannelClick, ...forwardProps} = this.props;
        const channelNodes = channels.map((channel) => {
                return <div key={channel.get("channel")}
                            className={classnames("channelLink", {unread: channel.get("unread")})}
                            onClick={() => onChannelClick(channel.get("channel"))}>
                    <div className="title">@{channel.get("channel")}</div>
                    {channel.has("followers") ?
                        <div className="followers">{channel.get("followers")} Followers</div>
                        : undefined}
                </div>
            }
        );
        const recommendedChannelNodes = recommendedChannels.map((channel) => {
                return <div key={channel.get("channel")}
                            className={classnames("channelLink", {unread: channel.get("unread")})}
                            onClick={() => onChannelClick(channel.get("channel"))}>
                    <div className="title">@{channel.get("channel")}</div>
                    {channel.has("followers") ?
                        <div className="followers">{channel.get("followers")} Followers</div>
                        : undefined}
                </div>
            }
        );
        const localChannelNodes = localChannels.map((channel) => {
                return <div key={channel.get("channel")}
                            className={classnames("channelLink", {unread: channel.get("unread")})}
                            onClick={() => onChannelClick(channel.get("channel"))}>
                    <div className="title">@{channel.get("channel")}</div>
                    {channel.has("followers") ?
                        <div className="followers">{channel.get("followers")} Followers</div>
                        : undefined}
                </div>
            }
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
};
