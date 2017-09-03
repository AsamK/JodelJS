import * as classnames from 'classnames';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';

import {PostListSortType} from '../enums/PostListSortType';
import {switchPostListSortType} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';

interface SortTypeLinkProps {
    sortType: PostListSortType;
}

interface SortTypeLinkComponentProps extends SortTypeLinkProps {
    active: boolean;
    sortType: PostListSortType;
    onClick: () => void;
}

const SortTypeLinkComponent = ({sortType, active, onClick}: SortTypeLinkComponentProps) => (
    <div className={classnames('sortType', sortType.toLowerCase(), {active})}
         onClick={onClick}
         title={
             sortType === PostListSortType.RECENT ? 'Neueste' :
                 sortType === PostListSortType.DISCUSSED ? 'Meist kommentierte' :
                     'Lauteste'
         }
    />
);

const mapStateToProps = (state: IJodelAppStore, ownProps: SortTypeLinkProps) => {
    return {
        active: ownProps.sortType === state.viewState.postListSortType,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: SortTypeLinkProps) => {
    return {
        onClick: () => {
            dispatch(switchPostListSortType(ownProps.sortType));
        },
    };
};

export const SortTypeLink = connect(mapStateToProps, mapDispatchToProps)(SortTypeLinkComponent);
