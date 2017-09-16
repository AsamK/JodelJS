import * as React from 'react';
import {connect, Dispatch} from 'react-redux';

import {IJodelAppStore} from '../redux/reducers';
import BackButton from './BackButton';

export interface IHashtagTopBarProps {
    hashtag: string;
}

const HashtagTopBarComponent = ({hashtag}: IHashtagTopBarProps) => {
    return (
        <div className="hashtagTopBar">
            <BackButton onClick={() => window.history.back()}/>
            <div className="title">#{hashtag}</div>
        </div>
    );
};

const mapStateToProps = (state: IJodelAppStore, ownProps: IHashtagTopBarProps) => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: IHashtagTopBarProps) => {
    return {};
};

export const HashtagTopBar = connect(mapStateToProps, mapDispatchToProps)(HashtagTopBarComponent);
