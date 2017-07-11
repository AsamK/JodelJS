import * as classnames from 'classnames';
import * as Immutable from 'immutable';
import * as React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {
    fetchMoreComments,
    fetchMorePosts,
    fetchPostsIfNeeded,
    selectPost,
    showAddPost,
    showChannelList,
    showSettings,
    switchPostSection,
    updatePosts,
} from '../redux/actions';
import {isLocationKnown} from '../redux/reducers';
import {getChannel, getPost} from '../redux/reducers/entities';
import {AddPost} from './AddPost';
import AppSettings from './AppSettings';
import ChannelList from './ChannelList';
import ChannelTopBar from './ChannelTopBar';
import FirstStart from './FirstStart';
import PostDetails from './PostDetails';
import PostListContainer from './PostListContainer';
import PostTopBar from './PostTopBar';
import Progress from './Progress';
import TopBar from './TopBar';

export interface JodelProps {
    section: string
    selectedPost: any
    selectedPicturePost: any
    selectedChannel: string
    locationKnown: boolean
    settings: any
    karma: number
    deviceUid: string
    isRegistered: boolean
    followedChannels: Immutable.List<any>
    recommendedChannels: Immutable.List<any>
    localChannels: Immutable.List<any>
    channelListShown: boolean
    dispatch: any
}

class Jodel extends Component<JodelProps> {
    private timer: number;

    componentDidMount() {
        this.timer = setInterval(this.refresh.bind(this), 20000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    onRefresh() {
        this.props.dispatch(updatePosts());
    }

    refresh() {
        if (!this.props.isRegistered) {
            return;
        }
        this.props.dispatch(fetchPostsIfNeeded());
    }

    handleClick(post) {
        this.props.dispatch(selectPost(post != null ? post.get('post_id') : null));
    }

    handleAddClick(post) {
        this.props.dispatch(showAddPost(true));
    }

    handleAddCommentClick(post) {
        this.props.dispatch(showAddPost(true));
    }

    onLoadMore() {
        this.props.dispatch(fetchMorePosts());
    }

    onLoadMoreComments() {
        this.props.dispatch(fetchMoreComments());
    }

    render() {
        if (this.props.deviceUid === undefined) {
            return <div className="jodel">
                <FirstStart/>
            </div>;
        } else if (this.props.settings.get('visible')) {
            return <AppSettings/>;
        } else {
            let selectedPost = this.props.selectedPost != null ? this.props.selectedPost : getEmptyPost();
            return <div className="jodel">
                <TopBar karma={this.props.karma}
                        showSettings={() => this.props.dispatch(showSettings(true))}
                        showChannelList={() => {
                            this.props.dispatch(showChannelList(!this.props.channelListShown));
                        }}
                />
                <div className={classnames('list', {
                    postShown: this.props.selectedPost != null,
                    isChannel: this.props.selectedChannel !== undefined,
                })}>
                    {this.props.selectedChannel !== undefined ?
                        <ChannelTopBar channel={this.props.selectedChannel}/>
                        : undefined
                    }
                    <PostListContainer onPostClick={this.handleClick.bind(this)}
                                       onRefresh={this.onRefresh} onAddClick={this.handleAddClick.bind(this)}
                                       onLoadMore={this.onLoadMore.bind(this)}/>
                </div>
                <div className={classnames('detail', {postShown: this.props.selectedPost != null})}>
                    <PostTopBar post={selectedPost}/>
                    <PostDetails post={selectedPost}
                                 onPostClick={this.refresh.bind(this)}
                                 onAddClick={this.handleAddCommentClick.bind(this)}
                                 locationKnown={this.props.locationKnown}
                                 onLoadMore={this.onLoadMoreComments.bind(this)}/>
                </div>
                {this.props.selectedPicturePost !== null ?
                    <div className="bigPicture" onMouseUp={e => window.history.back()}>
                        <img alt={this.props.selectedPicturePost.get('message')}
                             src={'https:' + this.props.selectedPicturePost.get('thumbnail_url')}/>
                        <img alt={this.props.selectedPicturePost.get('message')}
                             src={'https:' + this.props.selectedPicturePost.get('image_url')}/>
                    </div>
                    : ''}
                <AddPost/>
                <div className={classnames('channels', {channelListShown: this.props.channelListShown})}>
                    <ChannelList channels={this.props.followedChannels}
                                 recommendedChannels={this.props.recommendedChannels}
                                 localChannels={this.props.localChannels}
                                 onChannelClick={(hashtag) => this.props.dispatch(switchPostSection('channel:' + hashtag))}/>
                </div>
                <Progress/>
            </div>;
        }
    }
}

function getEmptyPost() {
    return Immutable.fromJS({
        'updated_at': '0000-00-00T00:00:00.000Z',
        'tags': [],
        'user_handle': '',
        'ptp_post': true,
        'team_vote_count': 0,
        'up_votes': [],
        'message': '',
        'distance': 0,
        'sum_votes_count': 0,
        'discovered_by': 0,
        'created_at': '0000-00-00T00:00:00.000Z',
        'post_own': 'team',
        'down_votes': [],
        'discovered': 0,
        'vote_count': 0,
        'post_id': '',
        'location': {'name': '', 'loc_coordinates': {'lng': 0, 'lat': 0}},
        'color': '000000',
    });
}

const mapStateToProps = (state) => {
    let selectedPicturePost = getPost(state, state.viewState.get('selectedPicturePostId'));
    if (selectedPicturePost === undefined) {
        selectedPicturePost = null;
    }
    let selectedPost = getPost(state, state.viewState.get('selectedPostId'));
    if (selectedPost === undefined) {
        selectedPost = null;
    } else if (selectedPost.has('children')) {
        selectedPost = selectedPost.set('children', selectedPost.get('children').map((child) => getPost(state, child)));
    }
    let section = state.viewState.get('postSection');
    let selectedChannel;
    if (section != null && section.startsWith('channel:')) {
        selectedChannel = section.substring(8);
    }
    let followedChannels = state.account.getIn(['config', 'followed_channels']);
    return {
        section,
        selectedPost,
        selectedPicturePost,
        selectedChannel,
        locationKnown: isLocationKnown(state),
        settings: state.viewState.get('settings'),
        karma: state.account.get('karma'),
        deviceUid: state.account.get('deviceUid'),
        isRegistered: state.account.getIn(['token', 'access']) !== undefined,
        followedChannels: followedChannels === undefined ? [] : followedChannels.map(c => getChannel(state, c)),
        recommendedChannels: state.account.get('recommendedChannels')
            .map(channel => followedChannels === undefined ? [] : followedChannels.reduce((v, c) => {
                if (c.toLowerCase() === channel.toLowerCase()) {
                    return undefined;
                } else {
                    return v;
                }
            }, getChannel(state, channel)))
            .filter(c => c !== undefined),
        localChannels: state.account.get('localChannels')
            .map(channel => followedChannels === undefined ? [] : followedChannels.reduce((v, c) => {
                if (c.toLowerCase() === channel.toLowerCase()) {
                    return undefined;
                } else {
                    return v;
                }
            }, getChannel(state, channel)))
            .filter(c => c !== undefined),
        channelListShown: state.viewState.getIn(['channelList', 'visible']),
    };
};

export default connect(mapStateToProps)(Jodel);
