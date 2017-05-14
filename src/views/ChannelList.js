'use strict';

import React, {Component} from "react";
import classnames from "classnames";
import PropTypes from 'prop-types';

export default class ChannelList extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        channels: PropTypes.array.isRequired,
        recommendedChannels: PropTypes.array.isRequired,
        localChannels: PropTypes.array.isRequired,
        onChannelClick: PropTypes.func.isRequired,
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
                return ChannelList.createChannelNode(channel, onChannelClick);
            }
        );
        const recommendedChannelNodes = recommendedChannels.map((channel) => {
                return ChannelList.createChannelNode(channel, onChannelClick);
            }
        );
        const localChannelNodes = localChannels.map((channel) => {
                return ChannelList.createChannelNode(channel, onChannelClick);
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

    static createChannelNode(channel, onChannelClick) {
        return <div key={channel.get("channel")}
                    className={classnames("channelLink", {unread: channel.get("unread")})}
                    onClick={() => onChannelClick(channel.get("channel"))}>
            {channel.has("image_url") && channel.get("image_url") != null ?
                <div className="channelPicture"
                     style={{backgroundImage: "url(https:" + channel.get("image_url") + ")"}}></div>
                : undefined}
            <div className="title">@{channel.get("channel")}</div>
            {channel.has("sponsored") && channel.get("sponsored") ?
                <div> (Sponsored)</div>
                : undefined}
            {channel.has("followers") ?
                <div className="followers">{channel.get("followers")} Followers</div>
                : undefined}
        </div>
    }
};
