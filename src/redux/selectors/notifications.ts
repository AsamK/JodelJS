import {createSelector} from 'reselect';
import {IJodelAppStore} from '../reducers';

export const getNotifications = (state: IJodelAppStore) => state.entities.notifications;

export const getUnreadNotificationsCount = createSelector(
    getNotifications,
    (notifications): number => notifications.filter(n => !n.read).length,
);
