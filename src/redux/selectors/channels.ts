import { createSelector } from 'reselect';

import { IChannel } from '../../interfaces/IChannel';
import { IJodelAppStore } from '../reducers';
import { selectedSectionSelector } from './view';

/* Begin Helpers **/

function getChannel(channels: { [key: string]: IChannel }, channel: string): IChannel {
    const c = channels[channel];
    if (!c) {
        return { channel };
    }
    return c;
}

/* End Helpers */

export const selectedChannelNameSelector = createSelector(
    selectedSectionSelector,
    (selectedSection): string | undefined => !selectedSection || !selectedSection.startsWith('channel:')
        ? undefined : selectedSection.substring(8));

const followedChannelNamesSelector = (state: IJodelAppStore) => state.account.config?.followed_channels ?? [];

export const isSelectedChannelFollowedSelector = createSelector(
    selectedChannelNameSelector, followedChannelNamesSelector,
    (selectedChannelName, followedChannelNames) => {
        if (!selectedChannelName) {
            return false;
        }
        const s = selectedChannelName.toLowerCase();
        return !!followedChannelNames.find(c => c.toLowerCase() === s);
    },
);
export const selectedChannelNameLikeFollowedSelector = createSelector(
    selectedChannelNameSelector, followedChannelNamesSelector,
    (selectedChannelName, followedChannelNames): string | undefined => {
        if (!selectedChannelName) {
            return undefined;
        }
        const s = selectedChannelName.toLowerCase();
        return followedChannelNames.find(c => c.toLowerCase() === s) || selectedChannelName;
    },
);

const recommendedChannelNamesSelector = (state: IJodelAppStore) => state.account.recommendedChannels;
const localChannelNamesSelector = (state: IJodelAppStore) => state.account.localChannels;
const countryChannelNamesSelector = (state: IJodelAppStore) => state.account.countryChannels;

const channelsSelector = (state: IJodelAppStore) => state.entities.channels;

export const followedChannelsSelector = createSelector(
    followedChannelNamesSelector, channelsSelector,
    (followedChannelNames, channels): IChannel[] => followedChannelNames
        .map(channel => getChannel(channels, channel)));

export const recommendedChannelsSelector = createSelector(
    recommendedChannelNamesSelector, followedChannelNamesSelector, channelsSelector,
    (recommendedChannelNames, followedChannelNames, channels): IChannel[] => recommendedChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const localChannelsSelector = createSelector(
    localChannelNamesSelector, followedChannelNamesSelector, channelsSelector,
    (localChannelNames, followedChannelNames, channels): IChannel[] => localChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const countryChannelsSelector = createSelector(
    countryChannelNamesSelector, followedChannelNamesSelector, channelsSelector,
    (countryChannelNames, followedChannelNames, channels): IChannel[] => countryChannelNames
        .filter(channel => !followedChannelNames.find(c => c.toLowerCase() === channel.toLowerCase()))
        .map(channel => getChannel(channels, channel)));

export const selectedChannelFollowersCountSelector = createSelector(
    selectedChannelNameSelector, channelsSelector,
    (selectedChannelName, channels): number => {
        if (!selectedChannelName) {
            return 0;
        }
        const followers = getChannel(channels, selectedChannelName).followers;
        return !followers ? 0 : followers;
    },
);
