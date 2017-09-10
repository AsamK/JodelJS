import {TokenType} from '../enums/TokenType';

export interface IToken {
    distinctId: string;
    refresh: string;
    access: string;
    expirationDate: number;
    type: TokenType;
}
