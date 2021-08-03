import { getTokenSet } from '../../auth/idporten';
import withSession from '../../auth/withSession';

const callback = withSession(async (req, res) => {
    const session = req.session;
    try {
        const tokenSet = await getTokenSet(req);
        session.set('tokenSet', tokenSet);
        session.unset('nonce');
        session.unset('state');
        await session.save();
        res.redirect('/'); // TODO: get redirect from request query params
    } catch (error) {
        console.error(error);
        session.destroy();
        res.status(403);
    }
});

export default callback;
