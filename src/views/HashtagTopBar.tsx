import React from 'react';
import {connect, Dispatch} from 'react-redux';

import {IJodelAppStore} from '../redux/reducers';
import {getSelectedHashtagName} from '../redux/selectors/view';
import BackButton from './BackButton';

export interface IHashtagTopBarProps {
    hashtag: string;
}

const HashtagTopBarComponent = ({hashtag}: IHashtagTopBarProps) => {
    return !hashtag ? null :
        <div className="hashtagTopBar">
            <BackButton onClick={() => window.history.back()}/>
            <div className="title">#{hashtag}</div>
        </div>;
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        hashtag: getSelectedHashtagName(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>) => {
    return {};
};

export const HashtagTopBar = connect(mapStateToProps, mapDispatchToProps)(HashtagTopBarComponent);
