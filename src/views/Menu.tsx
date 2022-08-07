import classnames from 'classnames';
import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { connect } from 'react-redux';

import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { showNotifications, showSearch, showSettings } from '../redux/actions';
import { showPictureOfDay } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';
import { unreadNotificationsCountSelector } from '../redux/selectors/notifications';

import './Menu.scss';
import { SectionLink } from './SectionLink';

interface IMenuComponentProps {
    showSettingsCallback: () => void;
    showNotificationsCallback: () => void;
    showSearchCallback: () => void;
    showPictureOfDayCallback: () => void;
    unreadNotifications: number;
}

interface IMenuComponentState {
    menuOpen: boolean;
}

class MenuComponent extends React.Component<IMenuComponentProps, IMenuComponentState> {
    constructor(props: IMenuComponentProps) {
        super(props);
        this.state = {
            menuOpen: false,
        };
    }

    public render(): React.ReactElement | null {
        const {
            unreadNotifications,
            showPictureOfDayCallback,
            showNotificationsCallback,
            showSettingsCallback,
            showSearchCallback,
        } = this.props;
        return (
            <div className={classnames('menu', { 'menu_new-notifications': unreadNotifications > 0 })}
                tabIndex={99999999}
                onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}
            >
                {!this.state.menuOpen ? '' :
                    <ul className="menu_content">
                        <li className="menu_entry">
                            <div onClick={showPictureOfDayCallback}>
                                <FormattedMessage
                                    id="showPictureOfDay"
                                    defaultMessage="Picture of the day"
                                />
                            </div>
                        </li>
                        <li className="menu_entry">
                            <SectionLink section="mine" />
                        </li>
                        <li className="menu_entry">
                            <SectionLink section="mineReplies" />
                        </li>
                        <li className="menu_entry">
                            <SectionLink section="mineVotes" />
                        </li>
                        <li className="menu_entry">
                            <SectionLink section="minePinned" />
                        </li>
                        <li className="menu_entry">
                            <div onClick={showNotificationsCallback}>
                                <FormattedMessage
                                    id="notifications"
                                    defaultMessage="Notifications"
                                />
                                {unreadNotifications === 0 ?
                                    '' :
                                    [
                                        '(',
                                        <FormattedNumber value={unreadNotifications} />,
                                        ')',
                                    ]
                                }
                            </div>
                        </li>
                        <li className="menu_entry">
                            <div onClick={showSearchCallback}>
                                <FormattedMessage
                                    id="search"
                                    defaultMessage="Search"
                                />
                            </div>
                        </li>
                        <li className="menu_entry">
                            <div onClick={showSettingsCallback}>
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
        unreadNotifications: unreadNotificationsCountSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        showNotificationsCallback: () => dispatch(showNotifications(true)),
        showPictureOfDayCallback: () => dispatch(showPictureOfDay()),
        showSearchCallback: () => dispatch(showSearch(true)),
        showSettingsCallback: () => dispatch(showSettings(true)),
    };
};

export const Menu = connect(mapStateToProps, mapDispatchToProps)(MenuComponent);
