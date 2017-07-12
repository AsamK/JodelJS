import * as NProgress from 'nprogress';
import * as React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {IJodelAppStore} from '../redux/reducers';

interface ProgressProps {
    isFetching: boolean
}

class Progress extends Component<ProgressProps> {
    state = {
        shown: false,
    };

    componentWillReceiveProps(nextProps) {
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

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render() {
        return <span/>;
    }
}

function mapStateToProps(state: IJodelAppStore, ownProps) {
    let isFetching = state.postsBySection.getIn([state.viewState.get('postSection'), 'isFetching']);
    return {isFetching: isFetching === undefined ? false : isFetching};
}

export default connect(mapStateToProps)(Progress);
