'use strict';

import React, {Component} from "react";

export default class ChannelList extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        channels: React.PropTypes.array.isRequired,
        recommendedChannels: React.PropTypes.array.isRequired,
        onChannelClick: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
    }

    render() {
        const {channels, recommendedChannels, onChannelClick, ...forwardProps} = this.props;
        const channelNodes = channels.map((channel) => {
                return <div key={channel} className="channelLink" onClick={() => onChannelClick(channel)}>#{channel}</div>
            }
        );
        let recommendedCount = 0;
        const recommendedChannelNodes = recommendedChannels.map((channel) => {
                if (channels.contains(channel)) {
                    return;
                }
                recommendedCount++;
                return <div key={channel} className="channelLink" onClick={() => onChannelClick(channel)}>#{channel}</div>
            }
        );
        return (
            <div className="channelList">
                <div className="channelListHeader">Kanäle(beta)</div>
                {channelNodes}
                {recommendedCount > 0 ?
                    <div className="channelListRecommended">Vorschläge</div>
                    : undefined
                }
                {recommendedChannelNodes}
            </div>
        );
    }
};
