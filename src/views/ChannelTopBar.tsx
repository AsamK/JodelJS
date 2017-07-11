import * as classnames from 'classnames';
import * as React from 'react';
import {connect} from 'react-redux';
import {followChannel} from '../redux/actions';
import {getChannel} from '../redux/reducers/entities';
import BackButton from './BackButton';

export interface ChannelTopBarProps {
    onFollowClick: (channel: string, follow: boolean) => void
    channel: string
    followerCount: number
    isFollowing: boolean
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

const mapStateToProps = (state, ownProps) => {
    let followers = getChannel(state, ownProps.channel).get('followers');
    return {
        followedName: state.account.getIn(['config', 'followed_channels']).reduce((v, c) => {
            if (c.toLowerCase() === ownProps.channel.toLowerCase()) {
                return c;
            } else {
                return v;
            }
        }, null),
        followerCount: followers === undefined ? 0 : followers,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onFollowClick: (channel, follow) => {
            dispatch(followChannel(channel, follow));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelTopBar);
