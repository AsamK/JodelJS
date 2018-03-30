import NProgress from 'nprogress';
import React from 'react';
import {connect, Dispatch} from 'react-redux';

import {IJodelAppStore} from '../redux/reducers';
import {getIsSelectedSectionFetching} from '../redux/selectors/posts';

interface IProgressProps {
    isFetching: boolean;
    dispatch: Dispatch<IJodelAppStore>;
}

class Progress extends React.Component<IProgressProps> {
    public state = {
        shown: false,
    };

    public componentWillReceiveProps(nextProps: IProgressProps) {
        if (nextProps.isFetching) {
            setTimeout(() => {
                if (this.props.isFetching && !this.state.shown) {
                    NProgress.start();
                    this.setState({shown: true});
                }
            }, 150);
        } else {
            NProgress.done();
            this.setState({shown: false});
        }
    }

    public shouldComponentUpdate(nextProps: IProgressProps) {
        return false;
    }

    public render() {
        return <span/>;
    }
}

function mapStateToProps(state: IJodelAppStore): Partial<IProgressProps> {
    return {
        isFetching: getIsSelectedSectionFetching(state),
    };
}

export default connect(mapStateToProps)(Progress);
