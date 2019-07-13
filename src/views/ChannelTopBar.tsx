import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { followChannel } from '../redux/actions';
import { IJodelAppStore } from '../redux/reducers';
import {
    isSelectedChannelFollowedSelector,
    selectedChannelFollowersCountSelector,
    selectedChannelNameLikeFollowedSelector,
} from '../redux/selectors/channels';
import BackButton from './BackButton';

export interface IChannelTopBarProps {
    onFollowClick: (channel: string, follow: boolean) => void;
    channel?: string;
    followerCount: number;
    isFollowing: boolean;
}

const ChannelTopBar = ({ onFollowClick, channel, followerCount, isFollowing }: IChannelTopBarProps) => {
    return !channel ? null :
        <div className="channelTopBar">
            <BackButton onClick={() => window.history.back()} />
            <div className="title">@{channel}</div>
            <div className="follow">
                {followerCount > 0 ? followerCount : null}
                <div className={classnames('followButton', { isFollowing })}
                    onClick={() => onFollowClick(channel, !isFollowing)}>
                </div>
            </div>
        </div>;
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        channel: selectedChannelNameLikeFollowedSelector(state),
        followerCount: selectedChannelFollowersCountSelector(state),
        isFollowing: isSelectedChannelFollowedSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        onFollowClick: (channel: string, follow: boolean) => {
            dispatch(followChannel(channel, follow));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelTopBar);
