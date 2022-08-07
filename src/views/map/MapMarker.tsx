import type { Map as LeafletMap, Marker } from 'leaflet';
import { divIcon, marker } from 'leaflet';
import React from 'react';

import type { IGeoCoordinates } from '../../interfaces/ILocation';

import { withLeafletMap } from './map-utils';
import './MapMarker.scss';

interface IMapMarkerProps {
    map: LeafletMap;
    location: IGeoCoordinates;
    onMarkerMoved: (location: IGeoCoordinates) => void;
}

class MapMarkerComponent extends React.PureComponent<IMapMarkerProps> {
    private locationMarker: Marker | undefined;

    public componentDidMount(): void {
        this.locationMarker = marker(
            {
                lat: this.props.location.latitude,
                lng: this.props.location.longitude,
            },
            {
                draggable: true,
                icon: divIcon({
                    className: 'map-marker-icon',
                    iconAnchor: [12, 41],
                    iconSize: [25, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                    tooltipAnchor: [16, -28],
                }),
            },
        );
        this.locationMarker.on('dragend', () => {
            const loc = this.locationMarker!.getLatLng();
            this.props.onMarkerMoved({ latitude: loc.lat, longitude: loc.lng });
        });
        this.locationMarker.addTo(this.props.map);
    }

    public componentDidUpdate(): void {
        this.locationMarker!.setLatLng({
            lat: this.props.location.latitude,
            lng: this.props.location.longitude,
        });
    }

    public componentWillUnmount(): void {
        this.locationMarker!.remove();
    }

    public render(): React.ReactElement | null {
        return null;
    }
}

export default withLeafletMap()(MapMarkerComponent);
