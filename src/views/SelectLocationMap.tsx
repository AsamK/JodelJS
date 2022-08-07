import React from 'react';

import type { IGeoCoordinates } from '../interfaces/ILocation';

import MapComponent from './map/Map';
import MapCircleComponent from './map/MapCircle';
import MapMarkerComponent from './map/MapMarker';

interface ISelectLocationMapProps {
    location: IGeoCoordinates | null;
    onLocationChanged: (location: IGeoCoordinates) => void;
}

export default ({ location, onLocationChanged }: ISelectLocationMapProps) => (
    <MapComponent location={location ?? { latitude: 0, longitude: 0 }}>
        {!location ? null : (
            <>
                <MapMarkerComponent
                    location={location}
                    onMarkerMoved={onLocationChanged}
                ></MapMarkerComponent>
                <MapCircleComponent location={location} radius={10000}></MapCircleComponent>
            </>
        )}
    </MapComponent>
);
