import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {showNotifications, showSettings} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';

import {SectionLink} from './SectionLink';

interface IMenuComponentProps {
    showSettings: () => void;
    showNotifications: () => void;
    unreadNotifications: number;
}

function MenuComponent({showSettings, showNotifications, unreadNotifications}: IMenuComponentProps) {
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
                    <div className="sectionLink" onClick={showNotifications}>
                        Benachrichtigungen {unreadNotifications === 0 ? '' : `(${unreadNotifications})`}
                    </div>
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

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        unreadNotifications: state.entities.notifications.filter(n => !n.read).length
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: {}) => {
    return {
        showSettings: () => dispatch(showSettings(true)),
        showNotifications: () => dispatch(showNotifications(true)),
    };
};

export const Menu = connect(mapStateToProps, mapDispatchToProps)(MenuComponent);
