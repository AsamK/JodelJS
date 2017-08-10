import {Color} from '../enums/Color';
import {NotificationScrollType} from '../enums/NotificationScrollType';
import {NotificationType} from '../enums/NotificationType';

export interface INotification {
    post_id: string;
    type: NotificationType;
    user_id: string;
    last_interaction: string;
    message: string;
    read: boolean;
    seen: boolean;
    scroll: NotificationScrollType;
    replier?: number;
    vote_count?: number;
    color: Color;
    notification_id: string;
}
