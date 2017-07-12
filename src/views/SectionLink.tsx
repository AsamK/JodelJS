import * as classnames from 'classnames';
import * as React from 'react';
import {connect} from 'react-redux';
import {switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';

interface SectionLinkProps {
    active: boolean
    section: string
    onClick: () => void
}

const SectionLink = ({section, active, onClick}: SectionLinkProps) => {
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

const mapStateToProps = (state: IJodelAppStore, ownProps) => {
    return {
        active: ownProps.section === state.viewState.get('postSection'),
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchPostSection(ownProps.section));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionLink);
