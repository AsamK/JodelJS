import React from 'react';
import { connect } from 'react-redux';

import type { INotification } from '../interfaces/INotification';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import { selectPostFromNotification } from '../redux/actions';
import type { IJodelAppStore } from '../redux/reducers';
import { notificationsSelector } from '../redux/selectors/notifications';

import './NotificationList.scss';
import { NotificationListItem } from './NotificationListItem';

export interface INotificationListComponentProps {
    notifications: readonly INotification[];
    selectPost: (postId: string) => void;
}

class NotificationListComponent extends React.PureComponent<INotificationListComponentProps> {
    public constructor(props: INotificationListComponentProps) {
        super(props);
    }

    public render(): React.ReactElement | null {
        const { notifications, selectPost } = this.props;
        return (
            <div className="notification-list">
                {notifications.length === 0
                    ? 'Noch keine Benachrichtigungen vorhanden'
                    : notifications.map(n => (
                          <NotificationListItem
                              notification={n}
                              selectPost={selectPost}
                          ></NotificationListItem>
                      ))}
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    return {
        notifications: notificationsSelector(state),
    };
};

const mapDispatchToProps = (dispatch: JodelThunkDispatch) => {
    return {
        selectPost: (postId: string) => dispatch(selectPostFromNotification(postId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationListComponent);
