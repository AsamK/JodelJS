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

type BaseComponentWrappedProps = IWithMapProps & React.ClassAttributes<any>;
type OuterComponentProps<P, C> = ObjectExclude<P, BaseComponentWrappedProps>;

export const withLeafletMap = () =>
    <P extends BaseComponentWrappedProps>(Component: React.ComponentType<P>)
        : React.ComponentType<React.ClassAttributes<typeof Component> & OuterComponentProps<P, typeof Component>> => {
        const forwardRef: React.RefForwardingComponent<typeof Component, OuterComponentProps<P, typeof Component>> =
            (innerProps, ref) =>
                <LeafletMapContext.Consumer>
                    {map => !map ? null : <Component map={map} ref={ref} {...innerProps}></Component>}
                </LeafletMapContext.Consumer>;

        const name = Component.displayName || Component.name;
        forwardRef.displayName = `withLeafletMap(${name})`;

        return React.forwardRef<typeof Component, OuterComponentProps<P, typeof Component>>(forwardRef);
    };
