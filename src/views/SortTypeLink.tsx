import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { PostListSortType } from '../enums/PostListSortType';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { switchPostListSortType } from '../redux/actions';
import type { IJodelAppStore } from '../redux/reducers';
import { selectedSortTypeSelector } from '../redux/selectors/view';

interface ISortTypeLinkProps {
    sortType: PostListSortType;
}

interface ISortTypeLinkComponentProps extends ISortTypeLinkProps {
    active: boolean;
    sortType: PostListSortType;
    onClick: () => void;
}

const SortTypeLinkComponent = ({ sortType, active, onClick }: ISortTypeLinkComponentProps) => (
    <div
        className={classnames('sortType', sortType.toLowerCase(), { active })}
        onClick={onClick}
        title={
            sortType === PostListSortType.RECENT
                ? 'Neueste'
                : sortType === PostListSortType.DISCUSSED
                ? 'Meist kommentierte'
                : 'Lauteste'
        }
    />
);

const mapStateToProps = (state: IJodelAppStore, ownProps: ISortTypeLinkProps) => {
    return {
        active: ownProps.sortType === selectedSortTypeSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch, ownProps: ISortTypeLinkProps) => {
    return {
        onClick: () => {
            dispatch(switchPostListSortType(ownProps.sortType));
        },
    };
};

export const SortTypeLink = connect(mapStateToProps, mapDispatchToProps)(SortTypeLinkComponent);
