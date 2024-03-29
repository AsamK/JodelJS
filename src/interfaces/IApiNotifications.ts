import type { Color } from '../enums/Color';
import type { NotificationScrollType } from '../enums/NotificationScrollType';
import type { NotificationType } from '../enums/NotificationType';

export interface IApiNotifications {
    notifications: IApiNotification[];
}

export interface IApiNotification {
    color: Color;
    last_interaction: string;
    message: string;
    notification_id: string;
    post_id: string;
    read: boolean;
    replier?: number;
    scroll: NotificationScrollType;
    seen: boolean;
    thumbnail_url: string;
    type: NotificationType;
    user_id: string;
    vote_count?: number;
}
