import React from 'react';
import {connect} from 'react-redux';
import {IPost} from '../interfaces/IPost';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {fetchPostsIfNeeded, showChannelList, showSettings} from '../redux/actions';
import {getNotificationsIfAvailable} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import {getDeviceUid, getIsConfigAvailable, getIsRegistered, getKarma} from '../redux/selectors/app';
import {getSelectedPicturePost, getSelectedPostId} from '../redux/selectors/posts';
import {
    getAddPostVisible,
    getChannelListVisible,
    getNotificationsVisible,
    getSearchVisible,
    getSettingsVisible,
} from '../redux/selectors/view';
import {AddPost} from './AddPost';
import AppSettings from './AppSettings';
import BigPicture from './BigPicture';
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
import ShareLink from './ShareLink';
import {ToastContainer} from './ToastContainer';
import {TopBar} from './TopBar';

export interface IJodelProps {
    addPostVisible: boolean;
    selectedPostId: string | null;
    selectedPicturePost: IPost | null;
    settingsVisible: boolean;
    karma: number;
    deviceUid: string | null;
    isRegistered: boolean;
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
            let content = null;

            if (this.props.addPostVisible) {
                content = <AddPost/>;
            } else if (this.props.notificationsVisible) {
                content = <NotificationList/>;
            } else if (this.props.searchVisible) {
                content = <Search/>;
            } else if (this.props.settingsVisible) {
                content = <AppSettings/>;
            } else if (this.props.channelListVisible) {
                content = <ChannelList/>;
            } else if (this.props.selectedPostId != null) {
                content = <div className="detail">
                    <PostTopBar/>
                    <PostDetails/>
                </div>;
            } else {
                content = <div className="list">
                    <ChannelTopBar/>
                    <HashtagTopBar/>
                    <PostListContainer/>
                </div>;
            }
            let overlay = null;
            if (this.props.selectedPicturePost) {
                overlay = <BigPicture post={this.props.selectedPicturePost}/>;
            }

            return <div className="jodel">
                <TopBar karma={this.props.karma}
                        showSettings={this.onShowSettings}
                        showChannelList={this.onShowChannelList}
                />
                <ToastContainer/>
                {content}
                {overlay}
                <ShareLink/>
                <Progress/>
            </div>;
        } else {
            return null;
        }
    }

    private refresh = () => {
        if (!this.props.isRegistered) {
            return;
        }
        this.props.dispatch(fetchPostsIfNeeded());
        this.props.dispatch(getNotificationsIfAvailable());
    };

    private onShowSettings = () => {
        this.props.dispatch(showSettings(true));
    };

    private onShowChannelList = () => {
        this.props.dispatch(showChannelList(!this.props.channelListVisible));
    };
}

const mapStateToProps = (state: IJodelAppStore): Partial<IJodelProps> => {
    return {
        addPostVisible: getAddPostVisible(state),
        channelListVisible: getChannelListVisible(state),
        deviceUid: getDeviceUid(state),
        isConfigAvailable: getIsConfigAvailable(state),
        isRegistered: getIsRegistered(state),
        karma: getKarma(state),
        notificationsVisible: getNotificationsVisible(state),
        searchVisible: getSearchVisible(state),
        selectedPicturePost: getSelectedPicturePost(state),
        selectedPostId: getSelectedPostId(state),
        settingsVisible: getSettingsVisible(state),
    };
};

export const Jodel = connect(mapStateToProps)(JodelComponent);
