export function getPersonnummerFromAccessToken(accessToken: string | undefined): string {
    if (!accessToken) {
        throw new Error('Invalid state: Missing access token');
    }

    return JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8')).pid;
}
