'use strict';

import React, {Component} from "react";
import {connect} from "react-redux";
import SelectDeviceUid from "./SelectDeviceUid";
import {createNewAccount, updateLocation} from "../redux/actions";
import {setDeviceUid} from "../redux/actions/api";

class FirstStart extends Component {
    constructor(props) {
        super(props);
        this.state = {deviceUid: undefined, isRegistering: false};
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
                    alert("Die Device UID muss aus genau 64 hexadezimal Ziffern bestehen.");
                } else {
                    this.props.dispatch(setDeviceUid(this.state.deviceUid));
                }
            }}>
                <SelectDeviceUid deviceUid={this.state.deviceUid} setDeviceUid={this.setDeviceUid}/>
                {this.props.location.latitude === undefined ?
                    <div className="locationError">
                        <p>Zum erstmaligen Anmelden muss der aktuelle Standort bekannt sein.
                            Die Standort Abfrage war jedoch noch nicht erfolgreich.
                        </p>
                        <a onClick={this.updateLocation}>Erneut versuchen</a>
                    </div>
                    : ""}
                <button type="submit" disabled={this.props.location.latitude === undefined}>
                    Jodeln beginnen
                </button>
            </form>
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

export default connect(mapStateToProps)(FirstStart);
