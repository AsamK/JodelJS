import React from "react";
import SectionLink from "./SectionLink";

let TopBar = ({karma, showSettings, showChannelList}) => {

    return (
        <div className="topBar">
            <SectionLink section="location"/>
            <SectionLink section="mine"/>
            <SectionLink section="mineReplies"/>
            <SectionLink section="mineVotes"/>
            <SectionLink section="minePinned"/>
            <div className="sectionLink channelListLink" onClick={showChannelList}>
                Kanäle
            </div>
            <div className="karma" onClick={showSettings}>
                {karma > 0 ? "+" : ""}{karma}
                <div className="subText">Mein Karma</div>
            </div>
        </div>
    )
};

export default TopBar
