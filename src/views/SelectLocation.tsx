import React from 'react';
import {FormattedMessage} from 'react-intl';

import {IGeoCoordinates} from '../interfaces/ILocation';

const USE_BROWSER_LOCATION = 'USE_BROWSER_LOCATION';
const MANUAL = 'MANUAL';

export interface ISelectLocationProps {
    location: IGeoCoordinates | null;
    useBrowserLocation: boolean;
    onChange: (useBrowserLocation: boolean, location: IGeoCoordinates | null) => void;
    onLocationRequested: () => void;
}

export class SelectLocation extends React.PureComponent<ISelectLocationProps> {
    constructor(props: ISelectLocationProps) {
        super(props);
    }

    public render() {
        const {location, useBrowserLocation, onLocationRequested} = this.props;
        return (
            <div className="selectLocation">
                <div className="locationType">
                    <label>
                        <input type="radio" value={USE_BROWSER_LOCATION} checked={useBrowserLocation}
                               onChange={this.handleChangeRadio}/>
                        <FormattedMessage
                            id="location_use_browser"
                            defaultMessage="Request location from browser"
                        />
                    </label>
                    <label>
                        <input type="radio" value={MANUAL} checked={!useBrowserLocation}
                               onChange={this.handleChangeRadio}/>
                        <FormattedMessage
                            id="location_manual"
                            defaultMessage="Select location manually"
                        />
                    </label>
                </div>
                {useBrowserLocation ? <div className="browserLocation">
                    <p>
                        <FormattedMessage
                            id="location_current"
                            defaultMessage="Current location"
                        />:
                        {!location ? '(Unbekannt)' : location.latitude + ', ' + location.longitude}</p>
                    <a onClick={onLocationRequested}>
                        <FormattedMessage
                            id="location_refresh"
                            defaultMessage="Refresh location"
                        />
                    </a>
                </div> : ''}
                {!useBrowserLocation ?
                    <div className="manualLocation">
                        <label>
                            <FormattedMessage
                                id="location_latitude"
                                defaultMessage="Latitude"
                            />:
                            <input type="number" min="-90" max="90" step="0.01"
                                   value={location ? location.latitude : ''}
                                   onChange={this.handleChangeLatitude}/>
                        </label>
                        <label>
                            <FormattedMessage
                                id="location_longitude"
                                defaultMessage="Longitude"
                            />:
                            <input type="number" min="-180" max="180" step="0.01"
                                   value={location ? location.longitude : ''}
                                   onChange={this.handleChangeLongitude}/>
                        </label>
                    </div>
                    : ''}
            </div>
        );
    }

    private handleChangeLatitude = (event: React.ChangeEvent<HTMLInputElement>) => {
        let latitudeNumber = Number.parseFloat(event.target.value);
        if (isNaN(latitudeNumber) || latitudeNumber < -90 || latitudeNumber > 90) {
            return;
        }
        latitudeNumber = Math.round(latitudeNumber * 100) / 100;
        const longitude = this.props.location ? this.props.location.longitude : 0;
        this.props.onChange(this.props.useBrowserLocation, {latitude: latitudeNumber, longitude});
    };

    private handleChangeLongitude = (event: React.ChangeEvent<HTMLInputElement>) => {
        let longitudeNumber = Number.parseFloat(event.target.value.replace(',', '.'));
        if (isNaN(longitudeNumber) || longitudeNumber < -180 || longitudeNumber > 180) {
            return;
        }
        longitudeNumber = Math.round(longitudeNumber * 100) / 100;
        const latitude = this.props.location ? this.props.location.latitude : 0;
        this.props.onChange(this.props.useBrowserLocation, {latitude, longitude: longitudeNumber});
    };

    private handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.value) {
            case USE_BROWSER_LOCATION:
                this.props.onChange(true, this.props.location);
                break;
            case MANUAL:
                this.props.onChange(false, this.props.location);
                break;
        }
    };
}
