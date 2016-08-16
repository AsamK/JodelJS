'use strict';

import React, {Component} from "react";
import {connect} from "react-redux";
import SelectLocation from "./SelectLocation";
import {updateLocation, _setLocation, setUseBrowserLocation, showSettings, updatePosts, setLocation} from "../redux/actions";
import Settings from "../app/settings";

class AppSettings extends Component {
    constructor(props) {
        super(props);
        this.updateLocation = this.updateLocation.bind(this);
    }

    updateLocation() {
        this.props.dispatch(updateLocation());
    }

    render() {
        return <div className="settings">
            <h2>Einstellungen</h2>
            <p>
                Device UID:
            </p>
            <div className="deviceUid">{this.props.deviceUid}</div>
            <p>Standort</p>
            <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                            latitude={this.props.location.latitude} longitude={this.props.location.longitude}
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
                                this.props.dispatch(_setLocation(latitude, longitude));
                            }}
                            onLocationRequested={this.updateLocation}
            />
            <button onClick={() => {
                this.props.dispatch(setLocation(this.props.location.latitude, this.props.location.longitude));
                this.props.dispatch(showSettings(false));
                this.props.dispatch(updatePosts());
            }}>
                Schließen
            </button>
        </div>;
    }
}

const mapStateToProps = (state) => {
    return {
        deviceUid: state.account.deviceUid,
        location: state.viewState.location,
        useBrowserLocation: state.viewState.useBrowserLocation,
    }
};

export default connect(mapStateToProps)(AppSettings);
