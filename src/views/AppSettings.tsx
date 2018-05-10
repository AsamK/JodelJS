import React from 'react';
import {connect} from 'react-redux';

import Settings from '../app/settings';
import {IApiExperiment} from '../interfaces/IApiConfig';
import {IGeoCoordinates, ILocation} from '../interfaces/ILocation';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {
    deleteHome,
    getImageCaptcha,
    sendVerificationAnswer,
    setHome,
    setLocation,
    setUseBrowserLocation,
    setUseHomeLocation,
    updateLocation,
} from '../redux/actions';
import {setInternationalFeed} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import {getDeviceUid, getLocation} from '../redux/selectors/app';
import {SelectLocation} from './SelectLocation';
import {VerificationImageCaptcha} from './VerificationImageCaptcha';

interface IAppSettingsStateProps {
    deviceUid: string | null;
    location: ILocation | null;
    homeSet: boolean;
    homeName: string | null;
    homeClearAllowed: boolean;
    verified: boolean;
    useBrowserLocation: boolean;
    useHomeLocation: boolean;
    imageUrl: string | null;
    imageWidth: number | null;
    experiments: IApiExperiment[];
    user_type: string | null;
    moderator: boolean;
    feedInternationalized: boolean;
    feedInternationalizable: boolean;
    pending_deletion: boolean;
}

interface IAppSettingsDispatchProps {
    showHome: (useHome: boolean) => void;
    updateLocation: () => void;
    getImageCaptcha: () => void;
    deleteHome: () => void;
    setHome: (location: IGeoCoordinates) => void;
    setLocation: (location: IGeoCoordinates) => void;
    setInternationalFeed: (enable: boolean) => void;
    setUseBrowserLocation: (useBrowserLocation: boolean) => void;
    sendVerificationAnswer: (answer: number[]) => void;
}

type IAppSettingsComponentProps = IAppSettingsDispatchProps & IAppSettingsStateProps;

class AppSettings extends React.Component<IAppSettingsComponentProps> {
    constructor(props: IAppSettingsComponentProps) {
        super(props);
    }

    public componentDidMount() {
        if (!this.props.verified) {
            this.props.getImageCaptcha();
        }
    }

    public render() {
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
                    {!this.props.verified && this.props.imageUrl && this.props.imageWidth ?
                        <VerificationImageCaptcha imageUrl={this.props.imageUrl} imageWidth={this.props.imageWidth}
                                                  onFinishedClick={answer => {
                                                      this.props.sendVerificationAnswer(answer);
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
    }
}

const mapStateToProps = (state: IJodelAppStore): IAppSettingsStateProps => {
    return {
        deviceUid: getDeviceUid(state),
        experiments: state.account.config ? state.account.config.experiments : [],
        feedInternationalizable: state.account.config ? state.account.config.feedInternationalizable : false,
        feedInternationalized: state.account.config ? state.account.config.feedInternationalized : false,
        homeClearAllowed: state.account.config ? state.account.config.home_clear_allowed : false,
        homeName: state.account.config ? state.account.config.home_name : null,
        homeSet: state.account.config ? state.account.config.home_set : false,
        imageUrl: state.imageCaptcha.image ? state.imageCaptcha.image.url : null,
        imageWidth: state.imageCaptcha.image ? state.imageCaptcha.image.width : null,
        location: getLocation(state),
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
        getImageCaptcha: () => dispatch(getImageCaptcha()),
        sendVerificationAnswer: (answer: number[]) => dispatch(sendVerificationAnswer(answer)),
        setHome: (location: IGeoCoordinates) => dispatch(setHome(location.latitude, location.longitude)),
        setInternationalFeed: (enable: boolean) => dispatch(setInternationalFeed(enable)),
        setLocation: (location: IGeoCoordinates) => dispatch(setLocation(location.latitude, location.longitude)),
        setUseBrowserLocation: (useBrowserLocation: boolean) => dispatch(setUseBrowserLocation(useBrowserLocation)),
        showHome: (useHome: boolean) => dispatch(setUseHomeLocation(useHome)),
        updateLocation: () => dispatch(updateLocation()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);
