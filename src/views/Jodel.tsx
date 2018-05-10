import classnames from 'classnames';
import React from 'react';
import {connect} from 'react-redux';

import {IChannel} from '../interfaces/IChannel';
import {IPost} from '../interfaces/IPost';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
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
import {IJodelAppStore} from '../redux/reducers';
import {getDeviceUid, getIsConfigAvailable, getIsRegistered, getKarma, isLocationKnown} from '../redux/selectors/app';
import {
    getCountryChannels,
    getFollowedChannels,
    getLocalChannels,
    getRecommendedChannels,
} from '../redux/selectors/channels';
import {getSelectedPicturePost, getSelectedPost, getSelectedPostChildren} from '../redux/selectors/posts';
import {
    getChannelListVisible,
    getNotificationsVisible,
    getSearchVisible,
    getSelectedSection,
    getSettingsVisible,
} from '../redux/selectors/view';
import {AddPost} from './AddPost';
import AppSettings from './AppSettings';
import ChannelList from './ChannelList';
import ChannelTopBar from './ChannelTopBar';
import FirstStart from './FirstStart';
import {HashtagTopBar} from './HashtagTopBar';
import {NotificationList} from './NotificationList';
import PostDetails from './PostDetails';
import {PostListContainer} from './PostListContainer';
import {PostTopBar} from './PostTopBar';
import Progress from './Progress';
import {Search} from './Search';
import {StickyList} from './StickyList';
import {ToastContainer} from './ToastContainer';
import {TopBar} from './TopBar';

export interface IJodelProps {
    section: string;
    selectedPost: IPost | null;
    selectedPostChildren: IPost[] | null;
    selectedPicturePost: IPost | null;
    locationKnown: boolean;
    settingsVisible: boolean;
    karma: number;
    deviceUid: string | null;
    isRegistered: boolean;
    followedChannels: IChannel[];
    recommendedChannels: IChannel[];
    localChannels: IChannel[];
    countryChannels: IChannel[];
    channelListVisible: boolean;
    notificationsVisible: boolean;
    searchVisible: boolean;
    isConfigAvailable: boolean;
    dispatch: JodelThunkDispatch;
}

class JodelComponent extends React.Component<IJodelProps> {
    private timer: number | undefined;

    public componentDidMount() {
        this.timer = window.setInterval(this.refresh, 20000);
    }

    public componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    public render() {
        if (!this.props.deviceUid) {
            return <div className="jodel">
                <ToastContainer/>
                <FirstStart/>
            </div>;
        } else if (this.props.isConfigAvailable) {
            return <div className="jodel">
                <TopBar karma={this.props.karma}
                        showSettings={this.onShowSettings}
                        showChannelList={this.onShowChannelList}
                />
                <ToastContainer/>
                <div className={classnames('list', {
                    postShown: this.props.selectedPost != null,
                })}>
                    <ChannelTopBar/>
                    <HashtagTopBar/>
                    <StickyList/>
                    <PostListContainer onPostClick={this.handleClick}
                                       onRefresh={this.onRefresh} onAddClick={this.handleAddClick}
                                       onLoadMore={this.onLoadMore}/>
                </div>
                {this.props.selectedPost ?
                    <div className={classnames('detail', {postShown: this.props.selectedPost != null})}>
                        <PostTopBar post={this.props.selectedPost}/>
                        <PostDetails post={this.props.selectedPost}
                                     postChildren={this.props.selectedPostChildren}
                                     onPostClick={this.refresh}
                                     onAddClick={this.handleAddCommentClick}
                                     locationKnown={this.props.locationKnown}
                                     onLoadMore={this.onLoadMoreComments}/>
                    </div>
                    : null}
                {this.props.selectedPicturePost ?
                    <div className="bigPicture" onMouseUp={e => window.history.back()}>
                        <img alt={this.props.selectedPicturePost.message}
                             src={'https:' + this.props.selectedPicturePost.image_url}/>
                        <img alt={this.props.selectedPicturePost.message}
                             src={'https:' + this.props.selectedPicturePost.thumbnail_url}/>
                    </div>
                    : null}
                <AddPost/>
                <div className={classnames('channels', {channelListShown: this.props.channelListVisible})}>
                    <ChannelList channels={this.props.followedChannels}
                                 recommendedChannels={this.props.recommendedChannels}
                                 localChannels={this.props.localChannels}
                                 countryChannels={this.props.countryChannels}
                                 onChannelClick={this.onChannelClick}/>
                </div>
                <div className={classnames('notifications', {notificationsShown: this.props.notificationsVisible})}>
                    <NotificationList/>
                </div>
                <div className={classnames('search', {searchShown: this.props.searchVisible})}>
                    <Search/>
                </div>
                <div className={classnames('settings', {settingsShown: this.props.settingsVisible})}>
                    <AppSettings/>
                </div>
                <Progress/>
            </div>;
        } else {
            return null;
        }
    }

    private onRefresh = () => {
        this.props.dispatch(updatePosts());
    }

    private refresh = () => {
        if (!this.props.isRegistered) {
            return;
        }
        this.props.dispatch(fetchPostsIfNeeded());
        this.props.dispatch(getNotificationsIfAvailable());
    }

    private handleClick = (post: IPost) => {
        this.props.dispatch(selectPost(post != null ? post.post_id : null));
    }

    private handleAddClick = () => {
        this.props.dispatch(showAddPost(true));
    }

    private handleAddCommentClick = () => {
        this.props.dispatch(showAddPost(true));
    }

    private onLoadMore = () => {
        this.props.dispatch(fetchMorePosts());
    }

    private onLoadMoreComments = () => {
        this.props.dispatch(fetchMoreComments());
    }

    private onShowSettings = () => {
        this.props.dispatch(showSettings(true));
    }

    private onShowChannelList = () => {
        this.props.dispatch(showChannelList(!this.props.channelListVisible));
    }

    private onChannelClick = (channelName: string) => {
        this.props.dispatch(switchPostSection('channel:' + channelName));
    }
}

const mapStateToProps = (state: IJodelAppStore): Partial<IJodelProps> => {
    return {
        channelListVisible: getChannelListVisible(state),
        countryChannels: getCountryChannels(state),
        deviceUid: getDeviceUid(state),
        followedChannels: getFollowedChannels(state),
        isConfigAvailable: getIsConfigAvailable(state),
        isRegistered: getIsRegistered(state),
        karma: getKarma(state),
        localChannels: getLocalChannels(state),
        locationKnown: isLocationKnown(state),
        notificationsVisible: getNotificationsVisible(state),
        recommendedChannels: getRecommendedChannels(state),
        searchVisible: getSearchVisible(state),
        section: getSelectedSection(state),
        selectedPicturePost: getSelectedPicturePost(state),
        selectedPost: getSelectedPost(state),
        selectedPostChildren: getSelectedPostChildren(state),
        settingsVisible: getSettingsVisible(state),
    };
};

export const Jodel = connect(mapStateToProps)(JodelComponent);
