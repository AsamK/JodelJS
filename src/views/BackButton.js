'use strict';

import React, {PropTypes} from "react";

const BackButton = ({onClick}) => {
    return <div className="backButton" onClick={onClick}>Zurück</div>
};

BackButton.propTypes = {
    onClick: PropTypes.func,
};

export default BackButton;