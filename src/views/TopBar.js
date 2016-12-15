import React from "react";
import SectionLink from "./SectionLink";
import classnames from "classnames";

let TopBar = ({karma, isHomeSet, useHomeLocation, showHome, showSettings, showChannelList}) => {

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
            {isHomeSet ?
                <div className={classnames("sectionLink", "homeLink", {active: useHomeLocation})} onClick={showHome}>
                    Heimat
                </div>
                : ""
            }
            <div className="karma" onClick={showSettings}>
                {karma > 0 ? "+" : ""}{karma}
                <div className="subText">Mein Karma</div>
            </div>
        </div>
    )
};

export default TopBar
