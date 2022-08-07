import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import Settings from '../app/settings';
import { UserType } from '../enums/UserType';
import type { IApiExperiment } from '../interfaces/IApiConfig';
import type { IGeoCoordinates, ILocation } from '../interfaces/ILocation';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import {
    deleteHome,
    setHome,
    setLocation,
    setUseBrowserLocation,
    setUseHomeLocation,
    updateLocation,
} from '../redux/actions';
import { setInternationalFeed, setUserLanguage, updateUserType } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';
import { canChangeUserTypeSelector, deviceUidSelector, locationSelector } from '../redux/selectors/app';

import { SelectLocation } from './SelectLocation';

interface IAppSettingsStateProps {
    canChangeUserType: boolean;
    deviceUid: string | null;
    location: ILocation | null;
    homeSet: boolean;
    homeName: string | null;
    homeClearAllowed: boolean;
    verified: boolean;
    useBrowserLocation: boolean;
    useHomeLocation: boolean;
    experiments: IApiExperiment[];
    user_type: UserType | null;
    moderator: boolean;
    feedInternationalized: boolean;
    feedInternationalizable: boolean;
    pending_deletion: boolean;
}

interface IAppSettingsDispatchProps {
    updateUserType: (userType: UserType) => void;
    showHome: (useHome: boolean) => void;
    updateLocation: () => void;
    deleteHome: () => void;
    setHome: (location: IGeoCoordinates) => void;
    setLocation: (location: IGeoCoordinates) => void;
    setInternationalFeed: (enable: boolean) => void;
    setUseBrowserLocation: (useBrowserLocation: boolean) => void;
    setUserLanguage: (language: string) => void;
}

type IAppSettingsComponentProps = IAppSettingsDispatchProps & IAppSettingsStateProps;

class AppSettings extends React.Component<IAppSettingsComponentProps> {
    public state = {
        user_language: '',
    };

    constructor(props: IAppSettingsComponentProps) {
        super(props);
    }

    public render(): React.ReactElement | null {
        return <div className="appSettings">
            <h2>Einstellungen</h2>
            <h3>Device UID:</h3>
            <div className="block">
                <div className="deviceUid">{this.props.deviceUid}</div>
            </div>
            <h3>Standort:</h3>
            <div className="block">
                <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                    location={this.props.location}
                    onChange={this.locationChange}
                    onLocationRequested={this.props.updateLocation}
                />
                <h4>
                    Heimat
                </h4>
                <div>
                    {this.props.homeSet ?
                        <div>
                            <label>
                                <input type="checkbox" className="homeLink"
                                    onChange={() => this.props.showHome(!this.props.useHomeLocation)}
                                    checked={this.props.useHomeLocation}
                                >
                                </input>
                                Heimat ({this.props.homeName}) verwenden
                            </label>
                            {this.props.homeClearAllowed ?
                                <button onClick={() => this.props.deleteHome()}>
                                    Heimat löschen (nur einmal möglich)
                                </button>
                                : ''
                            }
                        </div>
                        : this.props.location ?
                            <button onClick={() => {
                                if (!this.props.location) {
                                    return;
                                }
                                this.props.setHome(this.props.location);
                            }}>
                                Aktuellen Standort als Heimat setzen
                            </button>
                            : ''
                    }
                </div>
            </div>
            <h4>
                Internationale/Reise Jodel {!this.props.feedInternationalizable ?
                    '(Aus Gründen nicht aktivierbar)' :
                    undefined}
            </h4>
            <div className="block">
                <label>
                    <input type="checkbox" className="internationalFeedCheckbox"
                        onChange={() => this.props.setInternationalFeed(!this.props.feedInternationalized)}
                        checked={this.props.feedInternationalized}
                    >
                    </input>
                    Internationale Jodel aktivieren
                </label>
                <div>
                </div>
            </div>
            <h3>Konto</h3>
            <div className="block">
                <div className="accountVerification">
                    {this.props.verified ? 'Account is verified' : 'Account is not verified'}
                </div>
                <div className="features">
                    Features: {
                        this.props.experiments
                            .map(e => `${e.name} (${e.features.map(f => f === e.name ? '_' : f).join(', ')})`)
                            .join(', ')
                    }
                </div>
                <div className="userType">
                    <FormattedMessage
                        id="user_type"
                        defaultMessage="User type"
                    />:
                    <select
                        value={this.props.user_type || undefined}
                        disabled={!this.props.canChangeUserType}
                        onChange={e => this.props.updateUserType(e.target.value as UserType)}
                    >
                        <option value={undefined}>-</option>
                        <option value={UserType.STUDENT}>Student</option>
                        <option value={UserType.APPRENTICE}>Apprentice</option>
                        <option value={UserType.EMPLOYEE}>Employee</option>
                        <option value={UserType.HIGH_SCHOOL}>High school</option>
                        <option value={UserType.HIGH_SCHOOL_GRADUATE}>High school graduate</option>
                        <option value={UserType.OTHER}>Other</option>
                    </select>
                    {this.props.moderator ? ', Moderator' : ', kein Moderator'}
                </div>
                <div className="userLanguage">
                    <FormattedMessage
                        id="user_language"
                        defaultMessage="User language"
                    />:
                    <input
                        value={this.state.user_language || undefined}
                        onChange={
                            e => {
                                this.setState({ user_language: e.target.value });
                                if (e.target.value.length === 5) {
                                    this.props.setUserLanguage(e.target.value);
                                }
                            }
                        }
                    />
                </div>
                <div className="pendingDeletion">
                    {this.props.pending_deletion ? 'ACHTUNG: Konto ist zum löschen vorgemerkt' : ''}
                </div>
            </div>
            <button className="closeButton"
                onClick={() => {
                    if (this.props.location) {
                        this.props.setLocation(this.props.location);
                    }
                    window.history.back();
                }}>
                Schließen
            </button>
        </div>;
    }

    private locationChange = (useBrowserLocation: boolean, location: IGeoCoordinates | null) => {
        this.props.setUseBrowserLocation(useBrowserLocation);
        if (useBrowserLocation && !this.props.useBrowserLocation) {
            this.props.updateLocation();
        }
        if (!location) {
            if (useBrowserLocation || !Settings.DEFAULT_LOCATION) {
                return;
            }
            location = {
                latitude: Settings.DEFAULT_LOCATION.latitude,
                longitude: Settings.DEFAULT_LOCATION.longitude,
            };
        }
        this.props.setLocation(location);
    };
}

const mapStateToProps = (state: IJodelAppStore): IAppSettingsStateProps => {
    return {
        canChangeUserType: canChangeUserTypeSelector(state),
        deviceUid: deviceUidSelector(state),
        experiments: state.account.config ? state.account.config.experiments : [],
        feedInternationalizable: state.account.config ? state.account.config.feedInternationalizable : false,
        feedInternationalized: state.account.config ? state.account.config.feedInternationalized : false,
        homeClearAllowed: state.account.config ? state.account.config.home_clear_allowed : false,
        homeName: state.account.config ? state.account.config.home_name : null,
        homeSet: state.account.config ? state.account.config.home_set : false,
        location: locationSelector(state),
        moderator: state.account.config ? state.account.config.moderator : false,
        pending_deletion: state.account.config ? state.account.config.pending_deletion : false,
        useBrowserLocation: state.settings.useBrowserLocation,
        useHomeLocation: state.settings.useHomeLocation,
        user_type: state.account.config ? state.account.config.user_type : null,
        verified: state.account.config ? state.account.config.verified : false,
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch): IAppSettingsDispatchProps => {
    return {
        deleteHome: () => dispatch(deleteHome()),
        setHome: (location: IGeoCoordinates) => dispatch(setHome(location.latitude, location.longitude)),
        setInternationalFeed: (enable: boolean) => dispatch(setInternationalFeed(enable)),
        setLocation: (location: IGeoCoordinates) => dispatch(setLocation(location.latitude, location.longitude)),
        setUseBrowserLocation: (useBrowserLocation: boolean) => dispatch(setUseBrowserLocation(useBrowserLocation)),
        setUserLanguage: language => dispatch(setUserLanguage(language)),
        showHome: (useHome: boolean) => dispatch(setUseHomeLocation(useHome)),
        updateLocation: () => dispatch(updateLocation()),
        updateUserType: userType => dispatch(updateUserType(userType)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);
