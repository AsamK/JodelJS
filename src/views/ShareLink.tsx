import * as React from 'react';
import { connect } from 'react-redux';

import type { IJodelAppStore } from '../redux/reducers';
import { shareLinkSelector } from '../redux/selectors/view';
import './ShareLink.scss';

interface IShareLinkProps {
    link: string | null;
}

function shareLink(link: string): void {
    navigator.share({
        url: link,
    });
}

function onClose(): void {
    window.history.back();
}

function ShareLink({ link }: IShareLinkProps): React.ReactElement | null {
    if (!link) {
        return null;
    }
    return <div className="shareLink">
        <div className="link">
            <input className="linkDisplay" readOnly value={link} />
            {!('share' in navigator) ? null :
                <button className="shareButton" onClick={() => shareLink(link)}>Share</button>
            }
        </div>
        <button onClick={onClose}>Close</button>
    </div>;
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        link: shareLinkSelector(state),
    };
};

export default connect(mapStateToProps)(ShareLink);
