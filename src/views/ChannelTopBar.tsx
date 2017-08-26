import * as classnames from 'classnames';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {followChannel} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getChannel} from '../redux/reducers/entities';
import BackButton from './BackButton';

export interface ChannelTopBarProps {
    onFollowClick: (channel: string, follow: boolean) => void
    channel: string
    followerCount: number
    followedName: string
}

let ChannelTopBar = ({onFollowClick, channel, followerCount, followedName}: ChannelTopBarProps) => {
    let isFollowing = followedName !== null;
    return (
        <div className="channelTopBar">
            <BackButton onClick={() => window.history.back()}/>
            <div className="title">@{channel}</div>
            <div className="follow">
                {followerCount > 0 ? followerCount : ''}
                <div className={classnames('followButton', {isFollowing})}
                     onClick={() => onFollowClick(isFollowing ? followedName : channel, !isFollowing)}>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: IJodelAppStore, ownProps: ChannelTopBarProps) => {
    const followers = getChannel(state, ownProps.channel).followers;
    return {
        followedName: state.account.config
            ? state.account.config.followed_channels.find(c => c.toLowerCase() === ownProps.channel.toLowerCase()) || null
            : null,
        followerCount: !followers ? 0 : followers,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: Partial<ChannelTopBarProps>) => {
    return {
        onFollowClick: (channel: string, follow: boolean) => {
            dispatch(followChannel(channel, follow));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelTopBar);
