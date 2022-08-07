/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as LeafletMap } from 'leaflet';
import React from 'react';

export const LeafletMapContext = React.createContext<LeafletMap | undefined>(undefined);

interface IWithMapProps {
    map: LeafletMap;
}

/** Exclude from object O all keys that are also in object E
 */
type ObjectExclude<O, E> = { [K in Exclude<keyof O, keyof E>]: O[K] };

type BaseComponentWrappedProps = IWithMapProps & React.ClassAttributes<any>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OuterComponentProps<P, C> = ObjectExclude<P, BaseComponentWrappedProps>;

export const withLeafletMap = () =>
    <P extends BaseComponentWrappedProps>(Component: React.ComponentType<P>)
        : React.ComponentType<React.ClassAttributes<typeof Component> & OuterComponentProps<P, typeof Component>> => {
        const forwardRef: React.ForwardRefRenderFunction<typeof Component, OuterComponentProps<P, typeof Component>> =
            (innerProps, ref) => {
                const ComponentAny = Component as any;
                return <LeafletMapContext.Consumer>
                    {map => !map ? null : <ComponentAny map={map} ref={ref} {...innerProps}></ComponentAny>}
                </LeafletMapContext.Consumer> as any;
            };

        const name = Component.displayName || Component.name;
        forwardRef.displayName = `withLeafletMap(${name})`;

        return React.forwardRef<typeof Component, OuterComponentProps<P, typeof Component>>(forwardRef) as any;
    };
