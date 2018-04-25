import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import Settings from '../app/settings';
import {ILocation} from '../interfaces/ILocation';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
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
    dispatch: JodelThunkDispatch;
}

export interface IFirstStartState {
    deviceUid: string | null;
}

class FirstStart extends React.Component<IFirstStartProps, IFirstStartState> {
    constructor(props: IFirstStartProps) {
        super(props);
        this.state = {deviceUid: null};
        this.setDeviceUid = this.setDeviceUid.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
    }

    public componentDidMount() {
        this.setState({deviceUid: this.props.deviceUid});
    }

    public setDeviceUid(deviceUid: string | null) {
        this.setState({deviceUid});
    }

    public updateLocation() {
        this.props.dispatch(updateLocation());
    }

    public render() {
        return <div className="firstStart">
            <h1>
                <FormattedMessage
                    id="welcome_title"
                    defaultMessage="Welcome to the unofficial Jodel web app"
                />
            </h1>
            <form onSubmit={e => {
                e.preventDefault();
                if (!this.state.deviceUid) {
                    this.props.dispatch(createNewAccount());
                } else {
                    this.props.dispatch(setDeviceUid(this.state.deviceUid));
                }
            }}>
                <h3>
                    <FormattedMessage
                        id="account"
                        defaultMessage="Account"
                    />
                </h3>
                <div className="block">
                    <SelectDeviceUid deviceUid={this.state.deviceUid} setDeviceUid={this.setDeviceUid}/>
                </div>
                <h3>
                    <FormattedMessage
                        id="location"
                        defaultMessage="Location"
                    />
                </h3>
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
                        <div className="locationError formError">
                            <div>
                                <FormattedMessage
                                    id="location_error"
                                    defaultMessage={'The current Location must be known for the first registration.\n' +
                                    'However the location request was unsuccessful.'}
                                />
                            </div>
                            <a onClick={this.updateLocation}>
                                <FormattedMessage
                                    id="location_error_retry"
                                    defaultMessage="Retry location request"
                                />
                            </a>
                        </div>
                        : ''}
                </div>
                <button type="submit" disabled={!this.props.location}>
                    <FormattedMessage
                        id="jodel_register"
                        defaultMessage="Start Jodeling"
                    />
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
