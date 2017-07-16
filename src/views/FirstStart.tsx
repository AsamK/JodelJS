import * as React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import Settings from '../app/settings';
import {_setLocation, createNewAccount, setUseBrowserLocation, updateLocation} from '../redux/actions';
import {setDeviceUid} from '../redux/actions/api';
import {getLocation, IJodelAppStore} from '../redux/reducers';
import SelectDeviceUid from './SelectDeviceUid';
import SelectLocation from './SelectLocation';

export interface FirstStartProps {
    deviceUid: string
    latitude: number
    longitude: number
    useBrowserLocation: boolean
    dispatch: any
}

export interface FirstStartState {
    deviceUid: string
}

class FirstStart extends Component<FirstStartProps, FirstStartState> {
    constructor(props) {
        super(props);
        this.state = {deviceUid: undefined};
        this.setDeviceUid = this.setDeviceUid.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
    }

    componentDidMount() {
        this.setState({deviceUid: this.props.deviceUid});
    }

    componentWillUnmount() {
    }

    setDeviceUid(deviceUid) {
        this.setState({deviceUid: deviceUid});
    }

    updateLocation() {
        this.props.dispatch(updateLocation());
    }

    render() {
        return <div className="firstStart">
            <h1>Willkommen bei der inoffiziellen Jodel Web App</h1>
            <form onSubmit={e => {
                e.preventDefault();
                if (this.state.deviceUid === undefined) {
                    this.props.dispatch(createNewAccount());
                } else if (this.state.deviceUid.length !== 64) {
                    alert('Die Device UID muss aus genau 64 hexadezimal Ziffern bestehen.');
                } else {
                    this.props.dispatch(setDeviceUid(this.state.deviceUid));
                }
            }}>
                <SelectDeviceUid deviceUid={this.state.deviceUid} setDeviceUid={this.setDeviceUid}/>
                <p>Standort</p>
                <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                                latitude={this.props.latitude} longitude={this.props.longitude}
                                onChange={(useBrowserLocation, latitude, longitude) => {
                                    this.props.dispatch(setUseBrowserLocation(useBrowserLocation));
                                    if (!useBrowserLocation) {
                                        if (latitude === undefined) {
                                            latitude = Settings.DEFAULT_LOCATION.latitude;
                                        }
                                        if (longitude === undefined) {
                                            longitude = Settings.DEFAULT_LOCATION.longitude;
                                        }
                                    }
                                    this.props.dispatch(_setLocation(latitude, longitude, undefined));
                                }}
                                onLocationRequested={this.updateLocation}
                />
                {this.props.latitude === undefined ?
                    <div className="locationError">
                        <p>Zum erstmaligen Anmelden muss der aktuelle Standort bekannt sein.
                            Die Standort Abfrage war jedoch noch nicht erfolgreich.
                        </p>
                        <a onClick={this.updateLocation}>Erneut versuchen</a> oder oben den Standort manuell festlegen
                    </div>
                    : ''}
                <button type="submit" disabled={this.props.latitude === undefined}>
                    Jodeln beginnen
                </button>
            </form>
        </div>;
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    let loc = getLocation(state);
    return {
        deviceUid: state.account.deviceUid,
        latitude: loc ? loc.latitude : undefined,
        longitude: loc ? loc.longitude : undefined,
        useBrowserLocation: state.settings.useBrowserLocation,
    };
};

export default connect(mapStateToProps)(FirstStart);
