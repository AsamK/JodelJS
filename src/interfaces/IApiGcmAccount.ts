export interface IApiAndroidAccount {
    security_token: string;
    android_id: string;
}

export interface IApiGcmAccount {
    android_account: IApiAndroidAccount;
    gcm_token: string;
}
