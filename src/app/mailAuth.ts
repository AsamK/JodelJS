import Settings from './settings';

const headers = new Headers([['Content-Type', 'application/json']]);

export async function requestEmailVerification(email: string) {
    const payload = {
        email,
    };

    const res = await fetch(Settings.EMAIL_REQUEST_HELPER_URL, {
        body: JSON.stringify(payload),
        headers,
        method: 'POST',
        mode: 'cors',
    });

    if (!res.ok) {
        throw res;
    }
}

export interface FirebaseTokenResponse {
    access_token: string;
    user_id: string;
}

export async function generateFirebaseToken(
    email: string,
    linkFromEmail: string,
): Promise<FirebaseTokenResponse> {
    const payload = {
        email,
        link: linkFromEmail,
    };

    const res = await fetch(Settings.EMAIL_CONFIRM_HELPER_URL, {
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
