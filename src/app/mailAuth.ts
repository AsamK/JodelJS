import { toFormUrlencoded } from '../utils/utils';

const baseURL = 'https://www.googleapis.com';
const query = { key: 'AIzaSyDFUC30aJbUREs-vKefE6QmvoVL0qqOv60' };

const headers = new Headers([
    ['X-Android-Package', 'com.tellm.android.app'],
    ['X-Android-Cert', 'A4A8D4D7B09736A0F65596A868CC6FD620920FB0'],
    ['X-Client-Version', 'Android/Fallback/X21000001/FirebaseCore-Android'],
    ['Content-Type', 'application/json'],
]);

interface Error {
    error: {
        code: number;
        message: string;
        errors: {
            message: string;
            domain: string;
            reason: string;
        }[];
    };
}

interface GetOobConfirmationCodeResponse {
    kind: 'identitytoolkit#GetOobConfirmationCodeResponse';
    email: string;
}

export async function requestEmailVerification(email: string) {
    let url = baseURL + '/identitytoolkit/v3/relyingparty/getOobConfirmationCode';

    const payload = {
        requestType: 6,
        email,
        androidInstallApp: true,
        canHandleCodeInApp: true,
        continueUrl: 'https://jodel.com/app/magic-link-fallback',
        androidPackageName: 'com.tellm.android.app',
        androidMinimumVersion: '5.116.0',
    };

    const queryString = toFormUrlencoded(query);
    if (queryString) {
        url += '?' + queryString;
    }

    const res = await fetch(url, {
        body: JSON.stringify(payload),
        headers,
        method: 'POST',
        mode: 'cors',
    });

    if (!res.ok) {
        throw res;
    }
    const resBody = (await res.json()) as GetOobConfirmationCodeResponse | Error;
    if (!('kind' in resBody) || resBody.kind !== 'identitytoolkit#GetOobConfirmationCodeResponse') {
        throw res;
    }
}

export async function generateFirebaseToken(email: string, linkFromEmail: string) {
    const url = new URL(linkFromEmail);
    const urlLinkPart = url.searchParams.get('link');
    if (!urlLinkPart) {
        throw new Error('No token found in email link');
    }

    const urlLink = new URL(urlLinkPart);
    const oob_token = urlLink.searchParams.get('oobCode');
    if (!oob_token) {
        throw new Error('No token found in email link');
    }

    const firebase_token = await redeemOob(oob_token, email);
    const fresh_token = await refreshTokens(firebase_token.refreshToken);

    return fresh_token;
}

interface EmailLinkSigninResponse {
    kind: 'identitytoolkit#EmailLinkSigninResponse';
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    isNewUser: boolean;
}

async function redeemOob(oobCode: string, email: string): Promise<EmailLinkSigninResponse> {
    let url = baseURL + '/identitytoolkit/v3/relyingparty/emailLinkSignin';

    const payload = {
        email,
        oobCode,
    };

    const queryString = toFormUrlencoded(query);
    if (queryString) {
        url += '?' + queryString;
    }

    const res = await fetch(url, {
        body: JSON.stringify(payload),
        headers,
        method: 'POST',
        mode: 'cors',
    });

    if (!res.ok) {
        throw res;
    }
    const resBody = (await res.json()) as EmailLinkSigninResponse | Error;
    if (!('kind' in resBody) || resBody.kind !== 'identitytoolkit#EmailLinkSigninResponse') {
        throw res;
    }

    return resBody;
}

export interface FirebaseTokenResponse {
    access_token: string;
    expires_in: string;
    refresh_token: string;
    user_id: string;
    project_id: string;
}

async function refreshTokens(refreshToken: string): Promise<FirebaseTokenResponse> {
    let url = 'https://securetoken.googleapis.com/v1/token';

    const payload = {
        grantType: 'refresh_token',
        refreshToken,
    };

    const queryString = toFormUrlencoded(query);
    if (queryString) {
        url += '?' + queryString;
    }

    const res = await fetch(url, {
        body: JSON.stringify(payload),
        headers,
        method: 'POST',
        mode: 'cors',
    });

    if (res.ok) {
        return (await res.json()) as FirebaseTokenResponse;
    }

    throw res;
}
