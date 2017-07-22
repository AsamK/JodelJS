import {Hmac} from 'crypto';

declare const createHmac: (algorithm: string, key: string | Buffer) => Hmac;
export = createHmac;
