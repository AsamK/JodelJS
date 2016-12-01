'use strict';

import React, {Component} from "react";
import classnames from "classnames";

export default class Location extends Component {
    static propTypes = {
        distance: React.PropTypes.number.isRequired,
        location: React.PropTypes.string.isRequired,
        fromHome: React.PropTypes.bool,
    };

    render() {
        const {distance, location, fromHome, ...forwardProps} = this.props;
        return (
            <div className="location">
                <div className="distance">{distance}km weg</div>
                <div className={classnames("locationName", {fromHome})}>{location}</div>
            </div>
        );
    }
};