import { circle, Circle, Map as LeafletMap } from 'leaflet';
import React from 'react';

import { IGeoCoordinates } from '../../interfaces/ILocation';
import { withLeafletMap } from './map-utils';

interface IMapCircleProps {
    map: LeafletMap;
    location: IGeoCoordinates;
    radius: number;
}

class MapCircleComponent extends React.PureComponent<IMapCircleProps> {
    private circleShape: Circle | undefined;

    public componentDidMount() {
        const { location, radius } = this.props;
        this.circleShape = circle({
            lat: location.latitude,
            lng: location.longitude,
        }, {
            radius,
            });
        this.circleShape.addTo(this.props.map);
    }

    public componentDidUpdate() {
        const { location, radius } = this.props;
        this.circleShape!.setLatLng({
            lat: location.latitude,
            lng: location.longitude,
        });
        this.circleShape!.setRadius(radius);
    }

    public componentWillUnmount() {
        this.circleShape!.remove();
    }

    public render() {
        return null;
    }
}

export default withLeafletMap()(MapCircleComponent);
