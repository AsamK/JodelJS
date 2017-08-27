import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';

import Settings from '../app/settings';
import {IExperiment} from '../interfaces/IConfig';
import {IGeoCoordinates, ILocation} from '../interfaces/ILocation';
import {
    _setLocation,
    deleteHome,
    getImageCaptcha,
    sendVerificationAnswer,
    setHome,
    setLocation,
    setUseBrowserLocation,
    setUseHomeLocation,
    updateLocation,
} from '../redux/actions';
import {getLocation, IJodelAppStore} from '../redux/reducers';
import {SelectLocation} from './SelectLocation';
import {VerificationImageCaptcha} from './VerificationImageCaptcha';

export interface AppSettingsProps {
    deviceUid: string | null
    location: ILocation | null
    homeSet: boolean
    homeName: string | null
    homeClearAllowed: boolean
    verified: boolean
    useBrowserLocation: boolean
    useHomeLocation: boolean
    imageUrl: string | null
    imageWidth: number | null
    experiments: IExperiment[]
    user_type: string | null
    moderator: boolean
    feedInternationalized: boolean
    feedInternationalizable: boolean
    pending_deletion: boolean
}

interface AppSettingsComponentProps extends AppSettingsProps {
    dispatch: Dispatch<IJodelAppStore>
}

class AppSettings extends Component<AppSettingsComponentProps> {
    constructor(props: AppSettingsComponentProps) {
        super(props);
        this.updateLocation = this.updateLocation.bind(this);
        this.locationChange = this.locationChange.bind(this);
        this.showHome = this.showHome.bind(this);
    }

    updateLocation() {
        this.props.dispatch(updateLocation());
    }

    locationChange(useBrowserLocation: boolean, location: IGeoCoordinates | null) {
        this.props.dispatch(setUseBrowserLocation(useBrowserLocation));
        if (useBrowserLocation && !this.props.useBrowserLocation) {
            this.updateLocation();
        }
        if (!location) {
            if (useBrowserLocation) {
                return;
            }
            location = {
                latitude: Settings.DEFAULT_LOCATION.latitude,
                longitude: Settings.DEFAULT_LOCATION.longitude,
            };
        }
        this.props.dispatch(_setLocation(location.latitude, location.longitude));
    }

    componentDidMount() {
        if (!this.props.verified) {
            this.props.dispatch(getImageCaptcha());
        }
    }

    showHome() {
        this.props.dispatch(setUseHomeLocation(!this.props.useHomeLocation));
    }

    render() {
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
                                onLocationRequested={this.updateLocation}
                />
                <h4>
                    Heimat
                </h4>
                <div>
                    {this.props.homeSet ?
                        <div>
                            <label>
                                <input type="checkbox" className="homeLink"
                                       onChange={this.showHome} checked={this.props.useHomeLocation}>
                                </input>
                                Heimat ({this.props.homeName}) verwenden
                            </label>
                            {this.props.homeClearAllowed ?
                                <button onClick={() => {
                                    this.props.dispatch(deleteHome());
                                }}>
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
                                this.props.dispatch(setHome(this.props.location.latitude, this.props.location.longitude));
                            }}>
                                Aktuellen Standort als Heimat setzen
                            </button>
                            : ''
                    }
                </div>
            </div>
            <h3>Konto</h3>
            <div className="block">
                <div className="accountVerification">
                    {!this.props.verified && this.props.imageUrl && this.props.imageWidth ?
                        <VerificationImageCaptcha imageUrl={this.props.imageUrl} imageWidth={this.props.imageWidth}
                                                  onFinishedClick={answer => {
                                                      this.props.dispatch(sendVerificationAnswer(answer));
                                                  }
                                                  }/>
                        : 'Dein Jodel Konto ist verifiziert'}
                </div>
                <div className="features">
                    Features: {this.props.experiments.map(e => e.features.join(', ')).join(', ')}
                </div>
                <div className="userType">
                    Benutzertyp: {this.props.user_type || 'Unbekannt'}
                    {this.props.moderator ? ', Moderator' : ', kein Moderator'}
                </div>
                <div className="pendingDeletion">
                    {this.props.pending_deletion ? 'ACHTUNG: Konto ist zum löschen vorgemerkt' : ''}
                </div>
                <div className="internationalFeed">
                    {this.props.feedInternationalized ? 'Internationaler Feed' : ''}
                    {this.props.feedInternationalizable ? 'Internationalisierbarer Feed' : ''}
                </div>
            </div>
            <button className="closeButton"
                    onClick={() => {
                        if (this.props.location) {
                            this.props.dispatch(setLocation(this.props.location.latitude, this.props.location.longitude));
                        }
                        window.history.back();
                    }}>
                Schließen
            </button>
        </div>;
    }
}

const mapStateToProps = (state: IJodelAppStore): AppSettingsProps => {
    let loc = getLocation(state);
    return {
        deviceUid: state.account.deviceUid,
        location: loc,
        homeSet: state.account.config ? state.account.config.home_set : false,
        homeName: state.account.config ? state.account.config.home_name : null,
        homeClearAllowed: state.account.config ? state.account.config.home_clear_allowed : false,
        verified: state.account.config ? state.account.config.verified : false,
        useBrowserLocation: state.settings.useBrowserLocation,
        useHomeLocation: state.settings.useHomeLocation,
        imageUrl: state.imageCaptcha.image ? state.imageCaptcha.image.url : null,
        imageWidth: state.imageCaptcha.image ? state.imageCaptcha.image.width : null,
        experiments: state.account.config ? state.account.config.experiments : [],
        user_type: state.account.config ? state.account.config.user_type : null,
        moderator: state.account.config ? state.account.config.moderator : false,
        feedInternationalized: state.account.config ? state.account.config.feedInternationalized : false,
        feedInternationalizable: state.account.config ? state.account.config.feedInternationalizable : false,
        pending_deletion: state.account.config ? state.account.config.pending_deletion : false,
    };
};

export default connect(mapStateToProps)(AppSettings);
