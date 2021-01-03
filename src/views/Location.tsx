import classnames from 'classnames';
import React from 'react';

export interface ILocationProps {
    distance: number;
    location: string;
    fromHome: boolean;
}

export default class Location extends React.Component<ILocationProps> {
    public render(): React.ReactElement | null {
        const { distance, location, fromHome } = this.props;
        return (
            <div className="location">
                <div className="distance">{distance}km weg</div>
                <div className={classnames('locationName', { fromHome })}>{location}</div>
            </div>
        );
    }
}
