'use strict';

import React, {Component} from "react";

export default class Location extends Component {
    static propTypes = {
        distance: React.PropTypes.number.isRequired,
        location: React.PropTypes.string.isRequired,
    };

    render() {
        const {distance, location, ...forwardProps} = this.props;
        return (
            <div className="location">
                <div className="distance">{distance}km weg</div>
                <div className="locationName">{location}</div>
            </div>
        );
    }
};