import React from 'react';
import {connect} from 'react-redux';

import {IApiSticky} from '../interfaces/IApiSticky';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {selectPost, switchPostSection} from '../redux/actions';
import {closeSticky} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import {getStickies} from '../redux/selectors/posts';
import {Sticky} from './Sticky';

export interface IStickyListProps {
    stickies: ReadonlyArray<IApiSticky>;
    clickStickyClose: (sticky: string) => void;
    clickStickyLink: (postId: string) => void;
    clickStickyButton: (postId: string, buttonTitle: string) => void;
    switchToHashtag: (hashtag: string) => void;
    switchToChannel: (channel: string) => void;
}

class StickyListComponent extends React.Component<IStickyListProps> {

    constructor(props: IStickyListProps) {
        super(props);
    }

    public render() {
        const {
            stickies, clickStickyClose, clickStickyLink,
            clickStickyButton, switchToHashtag, switchToChannel,
        } = this.props;
        const stickyNodes = stickies.map(sticky => {
                return <Sticky key={sticky.stickypost_id} sticky={sticky}
                               onCloseClick={() => clickStickyClose(sticky.stickypost_id)}
                               onButtonClick={title => clickStickyButton(sticky.stickypost_id, title)}
                               onLinkClick={link => clickStickyLink(link)}
                               switchToHashtag={hashtag => switchToHashtag(hashtag)}
                               switchToChannel={channel => switchToChannel(channel)}
                />;
            },
        );
        return (
            <div className="stickyList">
                {stickyNodes}
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        stickies: getStickies(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        clickStickyButton: (postId: string, buttonTitle: string) => {
            /* TODO implement */
        },
        clickStickyClose: (stickyId: string) => dispatch(closeSticky(stickyId)),
        clickStickyLink: (postId: string) => dispatch(selectPost(postId)),
        switchToChannel: (channel: string) => dispatch(switchPostSection('channel:' + channel)),
        switchToHashtag: (hashtag: string) => dispatch(switchPostSection('hashtag:' + hashtag)),
    };
};

export const StickyList = connect(mapStateToProps, mapDispatchToProps)(StickyListComponent);
