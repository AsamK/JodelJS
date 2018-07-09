import React from 'react';
import {connect} from 'react-redux';

import {IPost} from '../interfaces/IPost';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {fetchMoreComments, showAddPost} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {isLocationKnown} from '../redux/selectors/app';
import {getSelectedPost, getSelectedPostChildren} from '../redux/selectors/posts';
import AddButton from './AddButton';
import {Post} from './Post';
import PostList from './PostList';
import ScrollToBottomButton from './ScrollToBottomButton';

interface IPostDetailsPropsComponent {
    post: IPost | null;
    postChildren: IPost[] | null;
    locationKnown: boolean;
    onAddClick: (e: React.MouseEvent<HTMLElement>) => void;
    onPostClick: () => void;
    onLoadMore: () => void;
}

export class PostDetailsComponent extends React.Component<IPostDetailsPropsComponent> {
    private scrollAtBottom = false;

    private scrollable: HTMLDivElement | null = null;

    constructor(props: IPostDetailsPropsComponent) {
        super(props);
    }

    public componentDidUpdate(prevProps: IPostDetailsPropsComponent) {
        if (this.props.post === null) {
            return;
        } else if (prevProps.post !== null && prevProps.post.post_id === this.props.post.post_id) {
            this.scrollAtBottom = false;
            return;
        }
        if (this.scrollable) {
            this.scrollable.scrollTop = 0;
        }
    }

    public componentDidMount() {
        if (this.scrollable) {
            this.scrollable.addEventListener('scroll', this.onScroll);
        }
        this.scrollAtBottom = false;
    }

    public componentWillUnmount() {
        if (this.scrollable) {
            this.scrollable.removeEventListener('scroll', this.onScroll);
        }
    }

    public render() {
        const {post, postChildren, locationKnown, onPostClick, onAddClick} = this.props;
        if (!post) {
            return null;
        }
        const childPosts = postChildren ? postChildren : [];

        return (
            <div className="postDetails" ref={c => this.scrollable = c}>
                <Post post={post} onPostClick={onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={onPostClick}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ''}
                <ScrollToBottomButton onClick={this.scrollToBottom}/>
            </div>
        );
    }

    private onScroll = () => {
        if (!this.scrollable || !this.props.onLoadMore) {
            return;
        }
        const isNearBottom = this.scrollable.scrollTop > 0 &&
            (this.scrollable.scrollTop + this.scrollable.clientHeight) >= (this.scrollable.scrollHeight - 500);
        if (isNearBottom && this.scrollAtBottom !== isNearBottom) {
            this.scrollAtBottom = isNearBottom;
            this.props.onLoadMore();
        } else {
            this.scrollAtBottom = isNearBottom;
        }
    };

    private scrollToBottom = () => {
        if (this.scrollable) {
            this.scrollable.scrollTop = this.scrollable.scrollHeight;
        }
    };
}

const mapStateToProps = (state: IJodelAppStore, ownProps: {}): Partial<IPostDetailsPropsComponent> => {
    return {
        locationKnown: isLocationKnown(state),
        post: getSelectedPost(state),
        postChildren: getSelectedPostChildren(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch,
                            ownProps: {}): Partial<IPostDetailsPropsComponent> => {
    return {
        onAddClick() {
            dispatch(showAddPost(true));
        },
        onLoadMore() {
            dispatch(fetchMoreComments());
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostDetailsComponent);
