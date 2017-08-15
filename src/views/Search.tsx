import * as React from 'react';
import {Component} from 'react';
import {connect, Dispatch} from 'react-redux';
import {searchPosts} from '../redux/actions/api';

import {IJodelAppStore} from '../redux/reducers';

interface ISearchProps {
}

interface ISearchComponentProps extends ISearchProps {
    suggestedHashtags: string[]
    searchPosts: (message: string, suggested: boolean) => void
}

interface ISearchComponentState {
    searchText: string
}

class SearchComponent extends Component<ISearchComponentProps, ISearchComponentState> {
    constructor(props: ISearchComponentProps) {
        super(props);
        this.state = {
            searchText: '',
        };
    }

    render() {
        return <div className="searchContainer">
            <form className="searchBox" onSubmit={e => {
                e.preventDefault();
                this.props.searchPosts(this.state.searchText, false);
            }}>
                <input type="text" value={this.state.searchText}
                       onChange={e => this.setState({searchText: e.target.value})}
                />
                <button type="submit">Suchen</button>
            </form>
            <div className="searchList">
            </div>
            <div className="suggestedHashtags">
                {this.props.suggestedHashtags.map(hashtag => <div className="hashtag">
                    #{hashtag}
                </div>)}
            </div>
        </div>;
    }
}

const mapStateToProps = (state: IJodelAppStore, ownProps: ISearchProps) => {
    return {
        suggestedHashtags: state.account.suggestedHashtags,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: ISearchProps) => {
    return {
        searchPosts: (message: string, suggested: boolean) => dispatch(searchPosts(message, suggested)),
    };
};

export const Search = connect(mapStateToProps, mapDispatchToProps)(SearchComponent);
