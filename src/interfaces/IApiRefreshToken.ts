import type { TokenType } from '../enums/TokenType';

export interface IApiRefreshToken {
    access_token: string;
    token_type: TokenType;
    expires_in: number;
    expiration_date: number;
    upgraded: boolean;
}
