import React from 'react';

import type { IPost } from '../interfaces/IPost';
import './BigPicture.scss';

export interface IBigPictureProps {
    post: IPost;
}

const BigPicture = ({ post }: IBigPictureProps) => {
    const imgRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        imgRef.current?.requestFullscreen?.();
    }, []);
    return (
        <div className="big-picture" onMouseUp={() => window.history.back()} ref={imgRef}>
            {'video_url' in post && post.video_url ? (
                <video src={'https:' + post.video_url} autoPlay></video>
            ) : post.image_url ? (
                <img alt={post.message} src={'https:' + post.image_url} />
            ) : null}
            <img alt={post.message} src={'https:' + post.thumbnail_url!} />
        </div>
    );
};

export default BigPicture;
