import classnames from 'classnames';
import React from 'react';

import type { INotification } from '../interfaces/INotification';
import { getNotificationDescription } from '../utils/notification.utils';

import './NotificationListItem.scss';
import { Time } from './Time';

interface INotificationListItemProps {
    notification: INotification;
    selectPost: (postId: string) => void;
}

export const NotificationListItem = ({ notification, selectPost }: INotificationListItemProps) => {
    return (
        <div
            className={classnames('notification-list-item', { unread: !notification.read })}
            key={notification.notification_id}
            onClick={() => {
                selectPost(notification.post_id);
            }}
        >
            <div className="type">{notification.type}</div>
            <div className="details">
                <div className="info-text">{getNotificationDescription(notification)}</div>
                <div className="message">{notification.message}</div>
            </div>
            <Time time={notification.last_interaction} />
        </div>
    );
};
