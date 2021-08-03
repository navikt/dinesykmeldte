import { generators } from 'openid-client';
import { getAuthUrl } from '../../auth/idporten';
import withSession from '../../auth/withSession';

const login = withSession(async (req, res) => {
    const session = req.session;
    session.set('nonce', generators.nonce());
    session.set('state', generators.state());
    await session.save();
    res.redirect(await getAuthUrl(session));
});

export default login;
