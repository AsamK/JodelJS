import React from 'react';

import type { FirebaseTokenResponse } from '../app/mailAuth';
import { generateFirebaseToken, requestEmailVerification } from '../app/mailAuth';

export const EmailVerification: React.FC<{ onToken: (token: FirebaseTokenResponse) => void }> = ({
    onToken,
}) => {
    const [email, setEmail] = React.useState('');
    const [emailLink, setEmailLink] = React.useState('');
    const [verificationRequested, setVerificationRequested] = React.useState(false);
    return (
        <div>
            <label>Email:</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
            <button
                onClick={() =>
                    requestEmailVerification(email).then(() => setVerificationRequested(true))
                }
            >
                Request verification
            </button>
            {verificationRequested && (
                <>
                    <label>Link from verification email:</label>
                    <input
                        type="text"
                        value={emailLink}
                        onChange={e => setEmailLink(e.target.value)}
                    />
                    <button onClick={() => generateFirebaseToken(email, emailLink).then(onToken)}>
                        Confirm email
                    </button>
                </>
            )}
        </div>
    );
};
