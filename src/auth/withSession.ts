import { NextApiRequest, NextApiResponse } from 'next';
import { Session, withIronSession } from 'next-iron-session';

export type NextIronRequest = NextApiRequest & { session: Session };
export type NextIronHandler = (req: NextIronRequest, res: NextApiResponse) => void | Promise<void>;

export default function withSession(handler: NextIronHandler) {
    return withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSWORD || 'pass',
        cookieName: 'session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
        },
    });
}
