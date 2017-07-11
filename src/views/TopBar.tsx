import * as React from 'react';
import Menu from './Menu';
import SectionLink from './SectionLink';

let TopBar = ({karma, showSettings, showChannelList}) => {

    return (
        <div className="topBar">
            <div className="barEntry">
                <Menu showSettings={showSettings}/>
            </div>
            <div className="barEntry">
                <SectionLink section="location"/>
            </div>
            <div className="barEntry sectionLink channelListLink" onClick={showChannelList}>
                Kanäle
            </div>
            <div className="karma" onClick={showSettings}>
                {(karma > 0 ? '+' : '') + karma}
                <div className="subText">Mein Karma</div>
            </div>
        </div>
    );
};

export default TopBar;
