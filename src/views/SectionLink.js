'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {switchPostSection} from '../redux/actions';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const SectionLink = ({section, active, onClick}) => {
    let name;
    switch (section) {
    case 'location':
        name = 'In der Nähe';
        break;
    case 'mine':
        name = 'Meine Jodel';
        break;
    case 'mineReplies':
        name = 'Meine Antworten';
        break;
    case 'mineVotes':
        name = 'Meine Votes';
        break;
    case 'minePinned':
        name = 'Meine Pins';
        break;
    }
    return <div className={classnames('sectionLink', section.toLowerCase(), {active})} onClick={onClick}>{name}</div>;
};

SectionLink.propTypes = {
    section: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.section === state.viewState.get('postSection')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchPostSection(ownProps.section));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionLink);
