import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';

import Settings from '../app/settings';
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
            <p>
                Device UID:
            </p>
            <div className="deviceUid">{this.props.deviceUid}</div>
            <p>
                Standort:
            </p>
            <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                            location={this.props.location}
                            onChange={this.locationChange}
                            onLocationRequested={this.updateLocation}
            />
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
                            Als Heimat setzen
                        </button>
                        : ''
                }
            </div>
            <div className="accountVerification">
                {!this.props.verified && this.props.imageUrl && this.props.imageWidth ?
                    <VerificationImageCaptcha imageUrl={this.props.imageUrl} imageWidth={this.props.imageWidth}
                                              onFinishedClick={answer => {
                                                  this.props.dispatch(sendVerificationAnswer(answer));
                                              }
                                              }/>
                    : 'You\'re Jodel account has been verified.'}
            </div>
            <button onClick={() => {
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
    };
};

export default connect(mapStateToProps)(AppSettings);
