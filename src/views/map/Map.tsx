import type { Map as LeafletMap } from 'leaflet';
import { map, tileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';

import type { IGeoCoordinates } from '../../interfaces/ILocation';

import { LeafletMapContext } from './map-utils';
import './Map.scss';

interface IMapComponentProps extends React.PropsWithChildren {
    location: IGeoCoordinates | null;
}

interface IMapComponentState {
    map: LeafletMap | undefined;
}

export default class MapComponent extends React.Component<IMapComponentProps, IMapComponentState> {
    public state: IMapComponentState = {
        map: undefined,
    };

    private mapElement = React.createRef<HTMLDivElement>();

    public componentDidMount(): void {
        const leafletMap = map(this.mapElement.current!);
        if (this.props.location) {
            leafletMap.setView(
                {
                    lat: this.props.location.latitude,
                    lng: this.props.location.longitude,
                },
                13,
            );
        }

        const tiles = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '\xa9 <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' +
                ' contributors',
            maxZoom: 18,
        });
        tiles.addTo(leafletMap);

        this.setState({
            map: leafletMap,
        });
    }

    public render(): React.ReactElement | null {
        return (
            <div className="map-root" ref={this.mapElement}>
                <LeafletMapContext.Provider value={this.state.map}>
                    {this.props.children}
                </LeafletMapContext.Provider>
            </div>
        );
    }

    public componentDidUpdate(): void {
        const leafletMap = this.state.map;
        if (leafletMap && this.props.location) {
            leafletMap.panTo({
                lat: this.props.location.latitude,
                lng: this.props.location.longitude,
            });
        }
    }

    public componentWillUnmount(): void {
        const leafletMap = this.state.map;
        if (leafletMap) {
            leafletMap.remove();
        }
    }
}
