import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';

import Settings from '../app/settings';
import {ILocation} from '../interfaces/ILocation';
import {_setLocation, createNewAccount, setUseBrowserLocation, updateLocation} from '../redux/actions';
import {setDeviceUid} from '../redux/actions/api';
import {IJodelAppStore} from '../redux/reducers';
import {getDeviceUid, getLocation} from '../redux/selectors/app';
import {SelectDeviceUid} from './SelectDeviceUid';
import {SelectLocation} from './SelectLocation';

export interface IFirstStartProps {
    deviceUid: string | null;
    location: ILocation | null;
    useBrowserLocation: boolean;
    dispatch: Dispatch<IJodelAppStore>;
}

export interface IFirstStartState {
    deviceUid: string | null;
}

class FirstStart extends Component<IFirstStartProps, IFirstStartState> {
    constructor(props: IFirstStartProps) {
        super(props);
        this.state = {deviceUid: null};
        this.setDeviceUid = this.setDeviceUid.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
    }

    public componentDidMount() {
        this.setState({deviceUid: this.props.deviceUid});
    }

    public setDeviceUid(deviceUid: string) {
        this.setState({deviceUid});
    }

    public updateLocation() {
        this.props.dispatch(updateLocation());
    }

    public render() {
        return <div className="firstStart">
            <h1>Willkommen bei der inoffiziellen Jodel Web App</h1>
            <form onSubmit={e => {
                e.preventDefault();
                if (!this.state.deviceUid) {
                    this.props.dispatch(createNewAccount());
                } else if (this.state.deviceUid.length !== 64) {
                    alert('Die Device UID muss aus genau 64 hexadezimal Ziffern bestehen.');
                } else {
                    this.props.dispatch(setDeviceUid(this.state.deviceUid));
                }
            }}>
                <h3>Konto</h3>
                <div className="block">
                    <SelectDeviceUid deviceUid={this.state.deviceUid} setDeviceUid={this.setDeviceUid}/>
                </div>
                <h3>Standort</h3>
                <div className="block">
                    <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                                    location={this.props.location}
                                    onChange={(useBrowserLocation, location) => {
                                        this.props.dispatch(setUseBrowserLocation(useBrowserLocation));
                                        if (!location) {
                                            if (useBrowserLocation || !Settings.DEFAULT_LOCATION) {
                                                return;
                                            }
                                            location = {
                                                latitude: Settings.DEFAULT_LOCATION.latitude,
                                                longitude: Settings.DEFAULT_LOCATION.longitude,
                                            };
                                        }
                                        this.props.dispatch(_setLocation(location.latitude, location.longitude));
                                    }}
                                    onLocationRequested={this.updateLocation}
                    />
                    {!this.props.location ?
                        <div className="locationError">
                            <p>Zum erstmaligen Anmelden muss der aktuelle Standort bekannt sein.
                                Die Standort Abfrage war jedoch noch nicht erfolgreich.
                            </p>
                            <a onClick={this.updateLocation}>Erneut versuchen</a> oder oben den Standort manuell
                            festlegen
                        </div>
                        : ''}
                </div>
                <button type="submit" disabled={!this.props.location}>
                    Jodeln beginnen
                </button>
            </form>
        </div>;
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        deviceUid: getDeviceUid(state),
        location: getLocation(state),
        useBrowserLocation: state.settings.useBrowserLocation,
    };
};

export default connect(mapStateToProps)(FirstStart);
