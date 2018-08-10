import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import React from 'react';
import {connect} from 'react-redux';

import {IJodelAppStore} from '../redux/reducers';
import {isSelectedSectionFetchingSelector} from '../redux/selectors/posts';

interface IProgressProps {
    isFetching: boolean;
}

class Progress extends React.PureComponent<IProgressProps> {
    private timer: number | null = null;

    public componentDidUpdate(prevProps: IProgressProps) {
        if (prevProps.isFetching === this.props.isFetching) {
            return;
        }

        if (this.props.isFetching) {
            this.timer = window.setTimeout(() => NProgress.start(), 150);
        } else {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (NProgress.isStarted()) {
                NProgress.done();
            }
        }
    }

    public componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        if (NProgress.isStarted()) {
            NProgress.done();
        }
    }

    public render() {
        return null;
    }
}

function mapStateToProps(state: IJodelAppStore) {
    return {
        isFetching: isSelectedSectionFetchingSelector(state),
    };
}

export default connect(mapStateToProps)(Progress);
