import { createSelector } from 'reselect';

import type { IJodelAppStore } from '../reducers';

export const notificationsSelector = (state: IJodelAppStore) => state.entities.notifications;

export const unreadNotificationsCountSelector = createSelector(
    notificationsSelector,
    (notifications): number => notifications.filter(n => !n.read).length,
);
