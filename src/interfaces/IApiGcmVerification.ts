export interface IApiGcmVerification {
    verification: {
        server_time: number;
        verification_code: string;
        type: 'silent_verification';
    };
    error?: string;
}
