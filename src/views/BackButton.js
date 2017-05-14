'use strict';

import React from "react";
import PropTypes from 'prop-types';

const BackButton = ({onClick}) => {
    return <div className="backButton" onClick={onClick}>Zurück</div>
};

BackButton.propTypes = {
    onClick: PropTypes.func,
};

export default BackButton;