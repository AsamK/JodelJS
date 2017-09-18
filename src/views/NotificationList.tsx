import * as classnames from 'classnames';
import * as React from 'react';
import {PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';

import {INotification} from '../interfaces/INotification';
import {selectPostFromNotification} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getNotifications} from '../redux/selectors/notifications';
import {getNotificationDescription} from '../utils/notification.utils';
import {Time} from './Time';

export interface INotificationListComponentProps {
    notifications: INotification[];
    selectPost: (postId: string) => void;
}

class NotificationListComponent extends PureComponent<INotificationListComponentProps> {
    public constructor(props: INotificationListComponentProps) {
        super(props);
    }

    public render() {
        const {notifications, selectPost} = this.props;
        return (
            <div className="notificationList">
                {notifications.length === 0 ?
                    'Noch keine Benachrichtigungen vorhanden' :
                    notifications.map(n =>
                        <div className={classnames('notification', {unread: !n.read})}
                             key={n.notification_id}
                             onClick={() => {
                                 selectPost(n.post_id);
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

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        notifications: getNotifications(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IJodelAppStore>) => {
    return {
        selectPost: (postId: string) => dispatch(selectPostFromNotification(postId)),
    };
};

export const NotificationList = connect(mapStateToProps, mapDispatchToProps)(NotificationListComponent);
