import * as classnames from 'classnames';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';

import {switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getSelectedSection} from '../redux/selectors/view';

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

const mapStateToProps = (state: IJodelAppStore, ownProps: ISectionLinkProps): Partial<ISectionLinkComponentProps> => {
    return {
        active: ownProps.section === getSelectedSection(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>,
                            ownProps: ISectionLinkProps): Partial<ISectionLinkComponentProps> => {
    return {
        onClick: () => {
            dispatch(switchPostSection(ownProps.section));
        },
    };
};

export const SectionLink = connect(mapStateToProps, mapDispatchToProps)(SectionLinkComponent);
