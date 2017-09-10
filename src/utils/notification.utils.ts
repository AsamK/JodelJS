import {NotificationType} from '../enums/NotificationType';
import {INotification} from '../interfaces/INotification';

export function getNotificationDescription(notification: INotification) {
    switch (notification.type) {

        case NotificationType.OJ_REPLY_REPLY:
            return 'OJ hat geantwortet';

        case NotificationType.OJ_REPLY_MENTION:
            return 'OJ hat dich erwähnt';
        case NotificationType.OJ_THANKS:
            return 'OJ bedankt sich';
        case NotificationType.OJ_PIN_REPLY:
            return 'OJ Antwort auf deinen Pin';
        case NotificationType.REPLY:
            return 'Antwort auf deinen Jodel';
        case NotificationType.REPLY_REPLY:
            return 'Antwort auf deine Antwort';
        case NotificationType.VOTE_REPLY:
            return `Deine Antwort hat ${notification.vote_count} Votes`;
        case NotificationType.VOTE_POST:
            return `Dein Jodel hat ${notification.vote_count} Votes`;
        case NotificationType.PIN:
            return 'Antwort auf deinen Pin';
        default:
            return notification.type;
    }
}
