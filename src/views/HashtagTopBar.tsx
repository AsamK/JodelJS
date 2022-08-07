import React from 'react';
import { connect } from 'react-redux';

import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import type { IJodelAppStore } from '../redux/reducers';
import { selectedHashtagNameSelector } from '../redux/selectors/view';

import BackButton from './BackButton';

export interface IHashtagTopBarProps {
    hashtag: string | undefined;
}

const HashtagTopBarComponent = ({ hashtag }: IHashtagTopBarProps) => {
    return !hashtag ? null :
        <div className="hashtagTopBar">
            <BackButton onClick={() => window.history.back()} />
            <div className="title">#{hashtag}</div>
        </div>;
};

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        hashtag: selectedHashtagNameSelector(state),
    };
};

const mapDispatchToProps = (_dispatch: JodelThunkDispatch) => {
    return {};
};

export const HashtagTopBar = connect(mapStateToProps, mapDispatchToProps)(HashtagTopBarComponent);
