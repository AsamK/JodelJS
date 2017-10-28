import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';
import {FormattedMessage, FormattedNumber} from 'react-intl';
import {connect, Dispatch} from 'react-redux';
import {showNotifications, showSearch, showSettings} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getUnreadNotificationsCount} from '../redux/selectors/notifications';

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
                                <FormattedMessage
                                    id="notifications"
                                    defaultMessage="Notifications"
                                />
                                {unreadNotifications === 0 ?
                                    '' :
                                    [
                                        '(',
                                        <FormattedNumber value={unreadNotifications}/>,
                                        ')',
                                    ]
                                }
                            </div>
                        </li>
                        <li className="menuEntry">
                            <div className="sectionLink" onClick={showSearchCallback}>
                                <FormattedMessage
                                    id="search"
                                    defaultMessage="Search"
                                />
                            </div>
                        </li>
                        <li className="menuEntry">
                            <div className="sectionLink" onClick={showSettingsCallback}>
                                <FormattedMessage
                                    id="settings"
                                    defaultMessage="Settings"
                                />
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
        unreadNotifications: getUnreadNotificationsCount(state),
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
