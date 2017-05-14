'use strict';

import React, {Component} from "react";
import classnames from "classnames";
import PropTypes from 'prop-types';

export default class Location extends Component {
    static propTypes = {
        distance: PropTypes.number.isRequired,
        location: PropTypes.string.isRequired,
        fromHome: PropTypes.bool,
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