import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { connect } from 'react-redux';

import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { showChannelList, showSettings } from '../redux/actions';
import type { IJodelAppStore } from '../redux/reducers';
import { karmaSelector } from '../redux/selectors/app';

import { Menu } from './Menu';
import { SectionLink } from './SectionLink';

interface ITopBarComponentProps {
    karma: number;
    onKarmaClick: () => void;
    onChannelsClick: () => void;
}

function TopBarComponent({
    karma,
    onKarmaClick,
    onChannelsClick,
}: ITopBarComponentProps): React.ReactElement | null {
    return (
        <div className="topBar">
            <Menu />
            <div className="barEntries">
                <SectionLink section="location" />
                <div className="sectionLink channelListLink" onClick={onChannelsClick}>
                    <FormattedMessage id="channels" defaultMessage="Channels" />
                </div>
            </div>
            <div className="karma" onClick={onKarmaClick}>
                {karma > 0 ? '+' : ''}
                <FormattedNumber value={karma} />
                <div className="subText">
                    <FormattedMessage id="my_karma" defaultMessage="My karma" />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        karma: karmaSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        onKarmaClick(): void {
            dispatch(showSettings(true));
        },
        onChannelsClick(): void {
            dispatch(showChannelList(true));
        },
    };
};

export const TopBar = connect(mapStateToProps, mapDispatchToProps)(TopBarComponent);
