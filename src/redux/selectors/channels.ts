import {createSelector} from 'reselect';

import {IChannel} from '../../interfaces/IChannel';
import {IJodelAppStore} from '../reducers';
import {getSelectedSection} from './view';

/* Begin Helpers **/

function getChannel(channels: { [key: string]: IChannel }, channel: string): IChannel {
    const c = channels[channel];
    if (!c) {
        return {channel};
    }
    return c;
}

/* End Helpers */

export const getSelectedChannelName = createSelector(
    getSelectedSection,
    (selectedSection): string | undefined => !selectedSection || !selectedSection.startsWith('channel:')
        ? undefined : selectedSection.substring(8));

const getFollowedChannelNames = (state: IJodelAppStore) => state.account.config ?
    state.account.config.followed_channels :
    [];

export const getIsSelectedChannelFollowed = createSelector(
    getSelectedChannelName, getFollowedChannelNames,
    (selectedChannelName, followedChannelNames) => {
        if (!selectedChannelName) {
            return false;
        }
        const s = selectedChannelName.toLowerCase();
        return !!followedChannelNames.find(c => c.toLowerCase() === s);
    },
);
export const getSelectedChannelNameLikeFollowed = createSelector(
    getSelectedChannelName, getFollowedChannelNames,
    (selectedChannelName, followedChannelNames): string | undefined => {
        if (!selectedChannelName) {
            return undefined;
        }
        const s = selectedChannelName.toLowerCase();
        return followedChannelNames.find(c => c.toLowerCase() === s) || selectedChannelName;
    },
);

const getRecommendedChannelNames = (state: IJodelAppStore) => state.account.recommendedChannels;
const getLocalChannelNames = (state: IJodelAppStore) => state.account.localChannels;
const getCountryChannelNames = (state: IJodelAppStore) => state.account.countryChannels;

const getChannels = (state: IJodelAppStore) => state.entities.channels;

export const getFollowedChannels = createSelector(
    getFollowedChannelNames, getChannels,
    (followedChannelNames, channels): IChannel[] => followedChannelNames
        .map(channel => getChannel(channels, channel)));

export const getRecommendedChannels = createSelector(
    getRecommendedChannelNames, getFollowedChannelNames, getChannels,
    (recommendedChannelNames, followedChannelNames, channels): IChannel[] => recommendedChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const getLocalChannels = createSelector(
    getLocalChannelNames, getFollowedChannelNames, getChannels,
    (localChannelNames, followedChannelNames, channels): IChannel[] => localChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const getCountryChannels = createSelector(
    getCountryChannelNames, getFollowedChannelNames, getChannels,
    (countryChannelNames, followedChannelNames, channels): IChannel[] => countryChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const getSelectedChannelFollowersCount = createSelector(
    getSelectedChannelName, getChannels,
    (selectedChannelName, channels): number => {
        if (!selectedChannelName) {
            return 0;
        }
        const followers = getChannel(channels, selectedChannelName).followers;
        return !followers ? 0 : followers;
    },
);
