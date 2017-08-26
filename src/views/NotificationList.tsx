import * as classnames from 'classnames';
import * as React from 'react';
import {PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';

import {INotification} from '../interfaces/INotification';
import {selectPostFromNotification} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getNotificationDescription} from '../utils/notification.utils';
import {Time} from './Time';

export interface NotificationListProps {
}

export interface NotificationListComponentProps extends NotificationListProps {
    notifications: INotification[]
    selectPostFromNotification: (postId: string) => void
}

class NotificationListComponent extends PureComponent<NotificationListComponentProps> {
    public constructor(props: NotificationListComponentProps) {
        super(props);
    }

    render() {
        const {notifications, selectPostFromNotification} = this.props;
        return (
            <div className="notificationList">
                {notifications.length === 0 ?
                    'Noch keine Benachrichtigungen vorhanden' :
                    notifications.map(n =>
                        <div className={classnames('notification', {unread: !n.read})}
                             key={n.notification_id}
                             onClick={() => {
                                 selectPostFromNotification(n.post_id);
                             }}
                        >
                            <div className="type">{n.type}</div>
                            <div className="details">
                                <div className="info-text">{getNotificationDescription(n)}</div>
                                <div className="message">{n.message}</div>
                            </div>
                            <Time time={n.last_interaction}/>
                        </div>,
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore, ownProps: NotificationListProps) => {
    return {
        notifications: state.entities.notifications,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>, ownProps: NotificationListProps) => {
    return {
        selectPostFromNotification: (postId: string) => dispatch(selectPostFromNotification(postId)),
    };
};

export const NotificationList = connect(mapStateToProps, mapDispatchToProps)(NotificationListComponent);
