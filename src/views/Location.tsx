import * as classnames from 'classnames';
import * as React from 'react';
import {Component} from 'react';

export interface ILocationProps {
    distance: number;
    location: string;
    fromHome: boolean;
}

export default class Location extends Component<ILocationProps> {
    public render() {
        const {distance, location, fromHome} = this.props;
        return (
            <div className="location">
                <div className="distance">{distance}km weg</div>
                <div className={classnames('locationName', {fromHome})}>{location}</div>
            </div>
        );
    }
}
