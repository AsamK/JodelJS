export interface IApiChannelsMeta {
    channels: IApiChannelsMetaChannel[];
}

export interface IApiChannelsMetaChannel {
    channel: string;
    unread: boolean;
    followers: number;
    sponsored: boolean;
}
