import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';
import {showNotifications, showSearch, showSettings} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';

import {SectionLink} from './SectionLink';

interface IMenuComponentProps {
    showSettingsCallback: () => void;
    showNotificationsCallback: () => void;
    showSearchCallback: () => void;
    unreadNotifications: number;
}

interface IMenuComponentState {
    menuOpen: boolean;
}

class MenuComponent extends Component<IMenuComponentProps, IMenuComponentState> {
    constructor(props: IMenuComponentProps) {
        super(props);
        this.state = {
            menuOpen: false,
        };
    }

    public render() {
        const {unreadNotifications, showNotificationsCallback, showSettingsCallback, showSearchCallback} = this.props;
        return (
            <div className={classnames('menu', {newNotifications: unreadNotifications > 0})}
                 tabIndex={99999999}
                 onClick={() => this.setState({menuOpen: !this.state.menuOpen})}
            >
                {!this.state.menuOpen ? '' :
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
                            <div className="sectionLink" onClick={showNotificationsCallback}>
                                Benachrichtigungen {unreadNotifications === 0 ? '' : `(${unreadNotifications})`}
                            </div>
                        </li>
                        <li className="menuEntry">
                            <div className="sectionLink" onClick={showSearchCallback}>
                                Suche
                            </div>
                        </li>
                        <li className="menuEntry">
                            <div className="sectionLink" onClick={showSettingsCallback}>
                                Einstellungen
                            </div>
                        </li>
                    </ul>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        unreadNotifications: state.entities.notifications.filter(n => !n.read).length,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: {}) => {
    return {
        showNotificationsCallback: () => dispatch(showNotifications(true)),
        showSearchCallback: () => dispatch(showSearch(true)),
        showSettingsCallback: () => dispatch(showSettings(true)),
    };
};

export const Menu = connect(mapStateToProps, mapDispatchToProps)(MenuComponent);
