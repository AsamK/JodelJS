export interface IApiExperiment {
    features: string[];
    group: string;
    name: string;
}

export interface IApiConfig {
    channels_follow_limit: number;
    experiments: IApiExperiment[];
    feedInternationalized: boolean;
    feedInternationalizable: boolean;
    followed_channels: string[];
    followed_hashtags: string[];
    home_set: boolean;
    home_name: string;
    home_clear_allowed: boolean;
    location: string;
    moderation_notify: boolean;
    moderator: boolean;
    pending_deletion: boolean;
    triple_feed_enabled: boolean;
    user_type: string | null;
    verified: boolean;
}
