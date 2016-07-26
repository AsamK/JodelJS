'use strict';

import React, {Component} from "react";

export default class ChildInfo extends Component {
    static propTypes = {
        child_count: React.PropTypes.number.isRequired,
    };

    render() {
        const {child_count, ...forwardProps} = this.props;
        return (
            <div className="childInfo" style={{visibility: child_count > 0 ? null : "hidden"}}>
                {child_count} Kommentare
            </div>
        );
    }
};