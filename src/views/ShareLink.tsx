import * as React from 'react';
import {connect} from 'react-redux';

import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {IJodelAppStore} from '../redux/reducers';
import {getShareLink} from '../redux/selectors/view';
import './ShareLink.scss';

interface IShareLinkProps {
    link: string | null;
}

function shareLink(link: string) {
    (navigator as any).share({
        url: link,
    });
}

function onClose() {
    window.history.back();
}

function ShareLink({link}: IShareLinkProps) {
    if (!link) {
        return null;
    }
    return <div className="shareLink">
        <div className="link">
            <input className="linkDisplay" readOnly value={link}/>
            {!('share' in navigator) ? null :
                <button className="shareButton" onClick={() => shareLink(link)}>Share</button>
            }
        </div>
        <button onClick={onClose}>Close</button>
    </div>;
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        link: getShareLink(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareLink);
