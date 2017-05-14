import React from "react";
import {connect} from "react-redux";
import BackButton from "./BackButton";
import {showChannelList, followChannel} from "../redux/actions";
import classnames from "classnames";
import {getChannel} from "../redux/reducers/entities";
import PropTypes from 'prop-types';

let ChannelTopBar = ({onBackClick, onFollowClick, channel, followerCount, followedName}) => {
    let isFollowing = followedName !== null;
    return (
        <div className="channelTopBar">
            <BackButton onClick={e => window.history.back()}/>
            <div className="title">@{channel}</div>
            <div className="follow">
                {followerCount > 0 ? followerCount : ""}
                <div className={classnames("followButton", {isFollowing})}
                     onClick={() => onFollowClick(isFollowing ? followedName : channel, !isFollowing)}>
                </div>
            </div>
        </div>
    )
};

ChannelTopBar.propTypes = {
    onBackClick: PropTypes.func,
    onFollowClick: PropTypes.func,
    channel: PropTypes.string.isRequired,
    followerCount: PropTypes.number,
    isFollowing: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => {
    let followers = getChannel(state, ownProps.channel).get("followers");
    return {
        followedName: state.account.getIn(["config", "followed_channels"]).reduce((v, c) => {
            if (c.toLowerCase() === ownProps.channel.toLowerCase()) {
                return c;
            } else {
                return v;
            }
        }, null),
        followerCount: followers === undefined ? 0 : followers,
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onBackClick: () => {
            dispatch(showChannelList(true))
        },
        onFollowClick: (channel, follow) => {
            dispatch(followChannel(channel, follow));
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelTopBar);
