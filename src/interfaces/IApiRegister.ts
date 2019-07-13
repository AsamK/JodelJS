import { TokenType } from '../enums/TokenType';

export interface IApiRegister {
    access_token: string;
    refresh_token: string;
    token_type: TokenType;
    expires_in: number;
    expiration_date: number;
    distinct_id: string;
    returning: boolean;
}
