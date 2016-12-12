'use strict';

import React, {Component} from "react";
import {connect} from "react-redux";
import SelectLocation from "./SelectLocation";
import {updateLocation, _setLocation, setUseBrowserLocation, setLocation, setHome} from "../redux/actions";
import Settings from "../app/settings";
import {getLocation} from "../redux/reducers";

class AppSettings extends Component {
    constructor(props) {
        super(props);
        this.updateLocation = this.updateLocation.bind(this);
        this.locationChange = this.locationChange.bind(this);
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
        this.props.dispatch(_setLocation(latitude, longitude));
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
                {this.props.homeSet ?
                    <span>(Heimat: {this.props.homeName})</span>
                    :
                    <button onClick={() => {
                        this.props.dispatch(setHome(this.props.latitude, this.props.longitude));
                  }}>
                        Als Heimat setzen
                    </button>
                }
            </p>
            <SelectLocation useBrowserLocation={this.props.useBrowserLocation}
                            latitude={this.props.latitude} longitude={this.props.longitude}
                            onChange={this.locationChange}
                            onLocationRequested={this.updateLocation}
            />
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
        deviceUid: state.account.get("deviceUid"),
        latitude: loc.get("latitude"),
        longitude: loc.get("longitude"),
        homeSet: state.account.getIn(["config", "home_set"]),
        homeName: state.account.getIn(["config", "home_name"]),
        useBrowserLocation: state.settings.get("useBrowserLocation"),
    }
};

export default connect(mapStateToProps)(AppSettings);
