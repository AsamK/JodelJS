import * as classnames from 'classnames';
import * as React from 'react';
import {connect} from 'react-redux';
import {switchPostListSortType} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';

interface SortTypeLinkProps {
    active: boolean
    sortType: string
    onClick: () => void
}

const SortTypeLink = ({sortType, active, onClick}: SortTypeLinkProps) => (
    <div className={classnames('sortType', sortType.toLowerCase(), {active})} onClick={onClick}/>
);

const mapStateToProps = (state: IJodelAppStore, ownProps) => {
    return {
        active: ownProps.sortType === state.viewState.get('postListSortType'),
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchPostListSortType(ownProps.sortType));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SortTypeLink);
