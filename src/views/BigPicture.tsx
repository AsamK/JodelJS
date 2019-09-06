import React from 'react';
import { IPost } from '../interfaces/IPost';
import './BigPicture.scss';

export interface IBigPictureProps {
    post: IPost;
}

const BigPicture = ({ post }: IBigPictureProps) => {
    return (
        <div className="big-picture" onMouseUp={e => window.history.back()}>
            {'video_url' in post
                ? <video src={'https:' + post.video_url} autoPlay></video>
                : <img alt={post.message}
                    src={'https:' + post.image_url} />
            }
            <img alt={post.message}
                src={'https:' + post.thumbnail_url} />
        </div>
    );
};

export default BigPicture;
