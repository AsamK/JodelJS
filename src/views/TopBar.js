import React from "react";

let TopBar = ({karma, switchPostSection, showSettings}) => {
    let _switchPostSection = (section) => switchPostSection(section);

    return (
        <div className="topBar">
            <div className="sectionLink" onClick={_switchPostSection.bind(this, "location")}>In der Nähe</div>
            <div className="sectionLink" onClick={_switchPostSection.bind(this, "mine")}>Meine Jodel</div>
            <div className="sectionLink" onClick={_switchPostSection.bind(this, "mineReplies")}>Meine Antworten</div>
            <div className="sectionLink" onClick={_switchPostSection.bind(this, "mineVotes")}>Meine Votes</div>
            <div className="karma" onClick={showSettings}>
                {karma > 0 ? "+" : ""}{karma}
                <div className="subText">Mein Karma</div>
            </div>
        </div>
    )
};

export default TopBar
