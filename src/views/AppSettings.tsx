import * as React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import Settings from '../app/settings';
import {
    _setLocation,
    deleteHome,
    getImageCaptcha,
    sendVerificationAnswer,
    setHome,
    setLocation,
    setUseBrowserLocation,
    setUseHomeLocation,
    updateLocation
} from '../redux/actions';
import {getLocation} from '../redux/reducers';
import SelectLocation from './SelectLocation';
import VerificationImageCaptcha from './VerificationImageCaptcha';

export interface AppSettingsProps {
    deviceUid: string;
    latitude: number;
    longitude: number;
    homeSet: boolean;
    homeName: string;
    homeClearAllowed: boolean;
    verified: boolean;
    useBrowserLocation: boolean;
    useHomeLocation: boolean;
    imageUrl: string;
    imageWidth: number;
    dispatch: any;
}

class AppSettings extends Component<AppSettingsProps> {
    constructor(props) {
        super(props);
        this.updateLocation = this.updateLocation.bind(this);
        this.locationChange = this.locationChange.bind(this);
        this.showHome = this.showHome.bind(this);
    }

    updateLocation() {
        this.props.dispatch(updateLocation());
    }

    locationChange(useBrowserLocation, latitude, longitude) {
        this.props.dispatch(setUseBrowserLocation(useBrowserLocation));
        if (useBrowserLocation && !this.props.useBrowserLocation) {
            this.updateLocation();
        }
        if (!useBrowserLocation) {
            if (latitude === undefined) {
                latitude = Settings.DEFAULT_LOCATION.latitude;
            }
            if (longitude === undefined) {
                longitude = Settings.DEFAULT_LOCATION.longitude;
            }
        }
        latitude = Math.round(latitude * 100) / 100;
        longitude = Math.round(longitude * 100) / 100;
        this.props.dispatch(_setLocation(latitude, longitude, undefined));
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
        return <div className="settings">
            <h2>Einstellungen</h2>
            <p>
                Device UID:
            </p>
            <div className="deviceUid">{this.props.deviceUid}</div>
            <p>
                Standort:
            </p>
            <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                            latitude={this.props.latitude} longitude={this.props.longitude}
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
                    :
                    <button onClick={() => {
                        this.props.dispatch(setHome(this.props.latitude, this.props.longitude));
                    }}>
                        Als Heimat setzen
                    </button>
                }
            </div>
            <div className="accountVerification">
                {!this.props.verified ?
                    <VerificationImageCaptcha imageUrl={this.props.imageUrl} imageWidth={this.props.imageWidth}
                                              onFinishedClick={answer => {
                                                  this.props.dispatch(sendVerificationAnswer(answer));
                                              }
                                              }/>
                    : 'You\'re Jodel account has been verified.'}
            </div>
            <button onClick={() => {
                this.props.dispatch(setLocation(this.props.latitude, this.props.longitude));
                window.history.back();
            }}>
                Schließen
            </button>
        </div>;
    }
}

const mapStateToProps = (state) => {
    let loc = getLocation(state);
    return {
        deviceUid: state.account.get('deviceUid'),
        latitude: loc.get('latitude'),
        longitude: loc.get('longitude'),
        homeSet: state.account.getIn(['config', 'home_set']),
        homeName: state.account.getIn(['config', 'home_name']),
        homeClearAllowed: state.account.getIn(['config', 'home_clear_allowed']),
        verified: state.account.getIn(['config', 'verified']),
        useBrowserLocation: state.settings.get('useBrowserLocation'),
        useHomeLocation: state.settings.get('useHomeLocation'),
        imageUrl: state.imageCaptcha.getIn(['image', 'url']),
        imageWidth: state.imageCaptcha.getIn(['image', 'width']),
    };
};

export default connect(mapStateToProps)(AppSettings);
