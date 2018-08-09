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
    onLoadMore: () => void;
}

export class PostDetailsComponent extends React.Component<IPostDetailsPropsComponent> {
    private scrollAtBottom = false;

    private scrollable = React.createRef<HTMLDivElement>();

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
        if (this.scrollable.current) {
            this.scrollable.current.scrollTop = 0;
        }
    }

    public componentDidMount() {
        if (this.scrollable.current) {
            this.scrollable.current.addEventListener('scroll', this.onScroll);
        }
        this.scrollAtBottom = false;
    }

    public componentWillUnmount() {
        if (this.scrollable.current) {
            this.scrollable.current.removeEventListener('scroll', this.onScroll);
        }
    }

    public render() {
        const {post, postChildren, locationKnown, onAddClick} = this.props;
        if (!post) {
            return null;
        }
        const childPosts = postChildren ? postChildren : [];

        return (
            <div className="postDetails" ref={this.scrollable}>
                <Post post={post} onPostClick={this.onPostClick}/>
                <PostList parentPost={post} posts={childPosts} onPostClick={this.onPostClick}/>
                {locationKnown ? <AddButton onClick={onAddClick}/> : ''}
                <ScrollToBottomButton onClick={this.scrollToBottom}/>
            </div>
        );
    }

    private onScroll = () => {
        const element = this.scrollable.current;
        if (!element || !this.props.onLoadMore) {
            return;
        }
        const isNearBottom = element.scrollTop > 0 &&
            (element.scrollTop + element.clientHeight) >= (element.scrollHeight - 500);
        if (isNearBottom && this.scrollAtBottom !== isNearBottom) {
            this.scrollAtBottom = isNearBottom;
            this.props.onLoadMore();
        } else {
            this.scrollAtBottom = isNearBottom;
        }
    };

    private scrollToBottom = () => {
        if (this.scrollable.current) {
            this.scrollable.current.scrollTop = this.scrollable.current.scrollHeight;
        }
    };

    private onPostClick = () => {
        // Do nothing
    };
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        locationKnown: isLocationKnown(state),
        post: getSelectedPost(state),
        postChildren: getSelectedPostChildren(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
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
