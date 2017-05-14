import React, {PureComponent} from "react";
import PropTypes from 'prop-types';

const USE_BROWSER_LOCATION = "USE_BROWSER_LOCATION";
const MANUAL = "MANUAL";

export default class SelectLocation extends PureComponent {
    constructor(props) {
        super(props);
        this.handleChangeLatitude = this.handleChangeLatitude.bind(this);
        this.handleChangeLongitude = this.handleChangeLongitude.bind(this);
        this.handleChangeRadio = this.handleChangeRadio.bind(this);
    }

    static propTypes = {
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        useBrowserLocation: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
        onLocationRequested: PropTypes.func.isRequired,
    };

    handleChangeLatitude(event) {
        const number = Number.parseFloat(event.target.value);
        if (isNaN(number) || number < -90 || number > 90) {
            return
        }
        this.props.onChange(this.props.useBrowserLocation, number, this.props.longitude);
    }

    handleChangeLongitude(event) {
        const number = Number.parseFloat(event.target.value.replace(',', '.'));
        if (isNaN(number) || number < -180 || number > 180) {
            return
        }
        this.props.onChange(this.props.useBrowserLocation, this.props.latitude, number);
    }

    handleChangeRadio(event) {
        switch (event.target.value) {
            case USE_BROWSER_LOCATION:
                this.props.onChange(true, this.props.latitude, this.props.longitude);
                break;
            case MANUAL:
                this.props.onChange(false, this.props.latitude, this.props.longitude);
                break;
        }
    }

    render() {
        const {latitude, longitude, useBrowserLocation, onLocationRequested, ...forwardProps} = this.props;
        return (
            <div className="selectLocation">
                <label>
                    <input type="radio" value={USE_BROWSER_LOCATION} checked={useBrowserLocation}
                           onChange={this.handleChangeRadio}/>
                    Standort vom Browser abfragen
                </label>
                {useBrowserLocation ? <div>
                        <p>Aktueller
                        Standort: {latitude === undefined ? "(Unbekannt)" : latitude + ", " + longitude}</p>
                        <a onClick={onLocationRequested}>Standort aktualisieren</a>
                    </div> : ""}
                <label>
                    <input type="radio" value={MANUAL} checked={!useBrowserLocation}
                           onChange={this.handleChangeRadio}/>
                    Standort manuell setzen
                </label>
                {!useBrowserLocation ?
                    <div>
                        <label>
                            Breitengrad:
                            <input type="number" min="-90" max="90" step="0.01" value={latitude}
                                   onChange={this.handleChangeLatitude}/>
                        </label>
                        <label>
                            Längengrad:
                            <input type="number" min="-180" max="180" step="0.01" value={longitude}
                                   onChange={this.handleChangeLongitude}/>
                        </label>
                    </div>
                    : ""}
            </div>
        );
    }
};
