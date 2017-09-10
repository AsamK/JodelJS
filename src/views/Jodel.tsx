import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';

import {IChannel} from '../interfaces/IChannel';
import {IPost} from '../interfaces/IPost';
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
import {getNotificationsIfAvailable} from '../redux/actions/api';
import {IJodelAppStore, isLocationKnown} from '../redux/reducers';
import {getChannel, getPost} from '../redux/reducers/entities';
import {IVisible} from '../redux/reducers/viewState';
import {AddPost} from './AddPost';
import AppSettings from './AppSettings';
import ChannelList from './ChannelList';
import ChannelTopBar from './ChannelTopBar';
import FirstStart from './FirstStart';
import {NotificationList} from './NotificationList';
import PostDetails from './PostDetails';
import {PostListContainer} from './PostListContainer';
import {PostTopBar} from './PostTopBar';
import Progress from './Progress';
import {Search} from './Search';
import {ToastContainer} from './ToastContainer';
import {TopBar} from './TopBar';

export interface IJodelProps {
    section: string;
    selectedPost: IPost | null;
    selectedPostChildren: IPost[] | null;
    selectedPicturePost: IPost | null;
    selectedChannel: string;
    locationKnown: boolean;
    settings: IVisible;
    karma: number;
    deviceUid: string | null;
    isRegistered: boolean;
    followedChannels: IChannel[];
    recommendedChannels: IChannel[];
    localChannels: IChannel[];
    channelListShown: boolean;
    notificationsShown: boolean;
    searchShown: boolean;
    dispatch: Dispatch<IJodelAppStore>;
}

class JodelComponent extends Component<IJodelProps> {
    private timer: number;

    public componentDidMount() {
        this.timer = setInterval(this.refresh.bind(this), 20000);
    }

    public componentWillUnmount() {
        clearInterval(this.timer);
    }

    public onRefresh() {
        this.props.dispatch(updatePosts());
    }

    public refresh() {
        if (!this.props.isRegistered) {
            return;
        }
        this.props.dispatch(fetchPostsIfNeeded());
        this.props.dispatch(getNotificationsIfAvailable());
    }

    public handleClick(post: IPost) {
        this.props.dispatch(selectPost(post != null ? post.post_id : null));
    }

    public handleAddClick() {
        this.props.dispatch(showAddPost(true));
    }

    public handleAddCommentClick() {
        this.props.dispatch(showAddPost(true));
    }

    public onLoadMore() {
        this.props.dispatch(fetchMorePosts());
    }

    public onLoadMoreComments() {
        this.props.dispatch(fetchMoreComments());
    }

    public render() {
        if (!this.props.deviceUid) {
            return <div className="jodel">
                <FirstStart/>
            </div>;
        } else {
            const selectedPost = this.props.selectedPost != null ? this.props.selectedPost : getEmptyPost();
            return <div className="jodel">
                <TopBar karma={this.props.karma}
                        showSettings={() => this.props.dispatch(showSettings(true))}
                        showChannelList={() => {
                            this.props.dispatch(showChannelList(!this.props.channelListShown));
                        }}
                />
                <ToastContainer/>
                <div className={classnames('list', {
                    isChannel: this.props.selectedChannel !== undefined,
                    postShown: this.props.selectedPost != null,
                })}>
                    {this.props.selectedChannel ?
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
                                 postChildren={this.props.selectedPostChildren}
                                 onPostClick={this.refresh.bind(this)}
                                 onAddClick={this.handleAddCommentClick.bind(this)}
                                 locationKnown={this.props.locationKnown}
                                 onLoadMore={this.onLoadMoreComments.bind(this)}/>
                </div>
                {this.props.selectedPicturePost ?
                    <div className="bigPicture" onMouseUp={e => window.history.back()}>
                        <img alt={this.props.selectedPicturePost.message}
                             src={'https:' + this.props.selectedPicturePost.thumbnail_url}/>
                        <img alt={this.props.selectedPicturePost.message}
                             src={'https:' + this.props.selectedPicturePost.image_url}/>
                    </div>
                    : ''}
                <AddPost/>
                <div className={classnames('channels', {channelListShown: this.props.channelListShown})}>
                    <ChannelList channels={this.props.followedChannels}
                                 recommendedChannels={this.props.recommendedChannels}
                                 localChannels={this.props.localChannels}
                                 onChannelClick={hashtag => this.props.dispatch(
                                     switchPostSection('channel:' + hashtag))}/>
                </div>
                <div className={classnames('notifications', {notificationsShown: this.props.notificationsShown})}>
                    <NotificationList/>
                </div>
                <div className={classnames('search', {searchShown: this.props.searchShown})}>
                    <Search/>
                </div>
                <div className={classnames('settings', {settingsShown: this.props.settings.visible})}>
                    <AppSettings/>
                </div>
                <Progress/>
            </div>;
        }
    }
}

function getEmptyPost(): IPost {
    return {
        color: '000000',
        created_at: '0000-00-00T00:00:00.000Z',
        distance: 0,
        location: {name: ''},
        message: '',
        post_id: '',
        post_own: 'team',
        updated_at: '0000-00-00T00:00:00.000Z',
        user_handle: '',
        vote_count: 0,
    };
}

const mapStateToProps = (state: IJodelAppStore): Partial<IJodelProps> => {
    let selectedPicturePost = null;
    if (state.viewState.selectedPicturePostId) {
        selectedPicturePost = getPost(state, state.viewState.selectedPicturePostId);
    }
    let selectedPost = null;
    if (state.viewState.selectedPostId) {
        selectedPost = getPost(state, state.viewState.selectedPostId);
    }
    let selectedPostChildren: IPost[] | null;
    if (selectedPost && selectedPost.children) {
        selectedPostChildren = selectedPost.children.map(child => getPost(state, child) as IPost);
    } else {
        selectedPostChildren = null;
    }
    const section = state.viewState.postSection;
    let selectedChannel;
    if (section != null && section.startsWith('channel:')) {
        selectedChannel = section.substring(8);
    }
    const followedChannels = state.account.config ? state.account.config.followed_channels : undefined;
    return {
        channelListShown: state.viewState.channelList.visible,
        deviceUid: state.account.deviceUid,
        followedChannels: followedChannels === undefined ? [] : followedChannels.map(c => getChannel(state, c)),
        isRegistered: state.account.token !== null,
        karma: state.account.karma,
        localChannels: state.account.localChannels
            .filter(channel => !followedChannels ?
                true :
                !followedChannels.find(c => c.toLowerCase() === channel.toLowerCase()))
            .map(channel => getChannel(state, channel)),
        locationKnown: isLocationKnown(state),
        notificationsShown: state.viewState.notifications.visible,
        recommendedChannels: state.account.recommendedChannels
            .filter(channel => !followedChannels ?
                true :
                !followedChannels.find(c => c.toLowerCase() === channel.toLowerCase()))
            .map(channel => getChannel(state, channel)),
        searchShown: state.viewState.search.visible,
        section,
        selectedChannel,
        selectedPicturePost,
        selectedPost,
        selectedPostChildren,
        settings: state.viewState.settings,
    };
};

export const Jodel = connect(mapStateToProps)(JodelComponent);
