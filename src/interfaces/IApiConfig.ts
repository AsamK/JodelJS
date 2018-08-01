import { UserType } from '../enums/UserType';

export interface IApiExperiment {
    features: string[];
    group: string;
    name: string;
}

export interface IApiConfig {
    age: number;
    can_change_type: boolean;
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
    min_post_length: number;
    home_min_post_length: number;
    moderation_notify: boolean;
    moderator: boolean;
    pending_deletion: boolean;
    special_post_colors: string[];
    triple_feed_enabled: boolean;
    user_blocked: boolean;
    user_profiling_types: string[];
    user_type: UserType | null;
    verified: boolean;
}
