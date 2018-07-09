import React from 'react';
import {IPost} from '../interfaces/IPost';

export interface IBigPictureProps {
    post: IPost;
}

const BigPicture = ({post}: IBigPictureProps) => {
    return (
        <div className="bigPicture" onMouseUp={e => window.history.back()}>
            <img alt={post.message}
                 src={'https:' + post.image_url}/>
            <img alt={post.message}
                 src={'https:' + post.thumbnail_url}/>
        </div>
    );
};

export default BigPicture;
