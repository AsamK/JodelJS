export interface IApiChannel {
    channel: string;
    image_url: string;
    followers: number;
    country_followers: number;
}

export interface IApiRecommendedChannels {
    recommended: IApiChannel[];
    local: IApiChannel[];
    country: IApiChannel[];
}
