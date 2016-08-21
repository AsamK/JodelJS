import React, {Component} from "react";
import {connect} from "react-redux";
import NProgress from "nprogress";

class Progress extends Component {
    state = {
        shown: false
    };

    componentWillReceiveProps(nextProps) {
        if (!process.browser) {
            return;
        }
        if (nextProps.isFetching > 0) {
            setTimeout(() => {
                if (this.props.isFetching > 0 && !this.state.shown) {
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

function mapStateToProps(state) {
    let section = state.postsBySection[state.viewState.postSection];
    return {isFetching: section === undefined ? false : section.isFetching};
}
export default connect(mapStateToProps)(Progress);
