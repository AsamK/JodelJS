import { Map as LeafletMap } from 'leaflet';
import React from 'react';

export const LeafletMapContext = React.createContext<LeafletMap | undefined>(undefined);

interface IWithMapProps {
    map: LeafletMap;
}

/**
 *  Exclude from object O all keys that are also in object E
 */
type ObjectExclude<O, E> = { [K in Exclude<keyof O, keyof E>]: O[K] };

export const withLeafletMap = () =>
    <P extends IWithMapProps>(Component: React.ComponentType<P>)
        : React.ComponentType<ObjectExclude<P, IWithMapProps>> =>
        <T extends {}>(props: T) => <LeafletMapContext.Consumer>
            {map => !map ? null : <Component map={map} {...props}></Component>}
        </LeafletMapContext.Consumer>;
