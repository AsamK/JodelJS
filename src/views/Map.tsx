import { map, Map as LeafletMap, tileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';

import { IGeoCoordinates } from '../interfaces/ILocation';
import './Map.less';

interface IMapComponentProps {
    location: IGeoCoordinates | null;
}

interface IMapComponentState {
    map: LeafletMap | undefined;
}

export const LeafletMapContext = React.createContext<LeafletMap | undefined>(undefined);

export default class MapComponent extends React.Component<IMapComponentProps, IMapComponentState> {
    public state: IMapComponentState = {
        map: undefined,
    };

    public componentDidMount() {
        const leafletMap = map('mapid');
        if (this.props.location) {
            leafletMap.setView({
                lat: this.props.location.latitude,
                lng: this.props.location.longitude,
            }, 13);
        }

        const tiles = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\xa9 <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' +
                ' contributors',
            maxZoom: 20,
        });
        tiles.addTo(leafletMap);

        this.setState({
            map: leafletMap,
        });
    }

    public render() {
        return <div id="mapid">
            <LeafletMapContext.Provider value={this.state.map}>
                {this.props.children}
            </LeafletMapContext.Provider>
        </div>;
    }

    public componentDidUpdate() {
        const leafletMap = this.state.map;
        if (leafletMap && this.props.location) {
            leafletMap.panTo({
                lat: this.props.location.latitude,
                lng: this.props.location.longitude,
            });
        }
    }
}
