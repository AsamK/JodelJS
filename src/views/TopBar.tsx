import * as React from 'react';
import {FormattedMessage, FormattedNumber} from 'react-intl';

import {Menu} from './Menu';
import {SectionLink} from './SectionLink';

interface ITopBarProps {
    karma: number;
    showSettings: () => void;
    showChannelList: () => void;
}

export function TopBar({karma, showSettings, showChannelList}: ITopBarProps) {
    return (
        <div className="topBar">
            <Menu/>
            <div className="barEntries">
                <SectionLink section="location"/>
                <div className="sectionLink channelListLink" onClick={showChannelList}>
                    <FormattedMessage
                        id="channels"
                        defaultMessage="Channels"
                    />
                </div>
            </div>
            <div className="karma" onClick={showSettings}>
                {(karma > 0 ? '+' : '')}
                <FormattedNumber value={karma}/>
                <div className="subText">
                    <FormattedMessage
                        id="my_karma"
                        defaultMessage="My karma"
                    />
                </div>
            </div>
        </div>
    );
}
