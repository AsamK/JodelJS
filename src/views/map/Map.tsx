import { map, Map as LeafletMap, tileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';

import { IGeoCoordinates } from '../../interfaces/ILocation';
import './Map.scss';

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

    private mapElement: HTMLElement | undefined;

    public componentDidMount() {
        const leafletMap = map(this.mapElement!);
        if (this.props.location) {
            leafletMap.setView({
                lat: this.props.location.latitude,
                lng: this.props.location.longitude,
            }, 13);
        }

        const tiles = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\xa9 <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' +
                ' contributors',
            maxZoom: 18,
        });
        tiles.addTo(leafletMap);

        this.setState({
            map: leafletMap,
        });
    }

    public render() {
        return <div className="map-root" ref={this.mapRef}>
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

    public componentWillUnmount() {
        const leafletMap = this.state.map;
        if (leafletMap) {
            leafletMap.remove();
        }
    }

    private mapRef = (ref: HTMLDivElement) => {
        this.mapElement = ref;
    };
}
