import React from 'react';
import { connect } from 'react-redux';

import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { searchPosts } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';

interface ISearchComponentProps {
    suggestedHashtags: readonly string[];
    searchPosts: (message: string, suggested: boolean) => void;
}

interface ISearchComponentState {
    searchText: string;
}

class SearchComponent extends React.Component<ISearchComponentProps, ISearchComponentState> {
    constructor(props: ISearchComponentProps) {
        super(props);
        this.state = {
            searchText: '',
        };
    }

    public render(): React.ReactElement | null {
        return (
            <div className="searchContainer">
                <form
                    className="searchBox"
                    onSubmit={e => {
                        e.preventDefault();
                        this.props.searchPosts(this.state.searchText, false);
                    }}
                >
                    <input
                        type="text"
                        value={this.state.searchText}
                        onChange={e => this.setState({ searchText: e.target.value })}
                    />
                    <button type="submit">Suchen</button>
                </form>
                <div className="searchList"></div>
                <div className="suggestedHashtags">
                    {this.props.suggestedHashtags.map(hashtag => (
                        <div className="hashtag">#{hashtag}</div>
                    ))}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        suggestedHashtags: state.account.suggestedHashtags,
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        searchPosts: (message: string, suggested: boolean) =>
            dispatch(searchPosts(message, suggested)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchComponent);
