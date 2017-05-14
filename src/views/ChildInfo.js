'use strict';

import React from "react";
import PropTypes from 'prop-types';

const ChildInfo = ({child_count}) => (
    <div className="childInfo" style={{visibility: child_count > 0 ? null : "hidden"}}>
        {child_count} Kommentare
    </div>
);

ChildInfo.propTypes = {
    child_count: PropTypes.number.isRequired,
};

export default ChildInfo;