import classnames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {selectedSectionSelector} from '../redux/selectors/view';

interface ISectionLinkProps {
    section: string;
}

interface ISectionLinkComponentProps extends ISectionLinkProps {
    active?: boolean;
    onClick?: () => void;
}

const SectionLinkComponent = ({section, active, onClick}: ISectionLinkComponentProps) => {
    let name;
    switch (section) {
        case 'location':
            name = <FormattedMessage id="near_posts" defaultMessage="Near"/>;
            break;
        case 'mine':
            name = <FormattedMessage id="my_posts" defaultMessage="My jodels"/>;
            break;
        case 'mineReplies':
            name = <FormattedMessage id="my_answers" defaultMessage="My answers"/>;
            break;
        case 'mineVotes':
            name = <FormattedMessage id="my_votes" defaultMessage="My votes"/>;
            break;
        case 'minePinned':
            name = <FormattedMessage id="my_pins" defaultMessage="My pins"/>;
            break;
    }
    return <div className={classnames('sectionLink', section.toLowerCase(), {active})} onClick={onClick}>{name}</div>;
};

const mapStateToProps = (state: IJodelAppStore, ownProps: ISectionLinkProps) => {
    return {
        active: ownProps.section === selectedSectionSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch,
                            ownProps: ISectionLinkProps) => {
    return {
        onClick: () => {
            dispatch(switchPostSection(ownProps.section));
        },
    };
};

export const SectionLink = connect(mapStateToProps, mapDispatchToProps)(SectionLinkComponent);
