import * as React from 'react';
import {MouseEvent} from 'react';

import {SectionLink} from './SectionLink';

export function Menu({showSettings}: { showSettings: (e: MouseEvent<HTMLDivElement>) => void }) {
    return (
        <div className="menu" tabIndex={99999999}>
            <ul className="menuContent">
                <li className="menuEntry">
                    <SectionLink section="mine"/>
                </li>
                <li className="menuEntry">
                    <SectionLink section="mineReplies"/>
                </li>
                <li className="menuEntry">
                    <SectionLink section="mineVotes"/>
                </li>
                <li className="menuEntry">
                    <SectionLink section="minePinned"/>
                </li>
                <li className="menuEntry">
                    <div className="sectionLink" onClick={showSettings}>
                        Einstellungen
                    </div>
                </li>
            </ul>
        </div>
    );
}
