import { Bot, Schema } from '@shared/schema';
import admin from '../../admin';

/**
 * Read bot specific theming. This is not using graphql because current version of it does
 * not support untyped objects. Theming is most likely to expand a lot while development
 * and maintaining a graphql and typescript type feels as unnesessary worl load. So the
 * response will be given as a plan json -file.
 *
 * @param req
 * @param res
 * @param next
 */
const theme = (req, res) => {
  const organizationId = req.params.organizationId;
  const botName: string = req.params.bot;

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');

  admin
    .firestore()
    .doc(`/${Schema.ORGANIZATIONS}/${organizationId}/${Schema.BOTS}/${botName}`)
    .get()
    .then(snapshot => {
      if (!snapshot.exists) {
        res.write(`Theme not found for organization: ${organizationId} and bot: ${botName}.`);
        res.status(404).end();
        return;
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      const bot: Bot = snapshot.data() as Bot;
      res.write(JSON.stringify(bot.configuration));
      res.end();
    })
    .catch(error => {
      res.write(error);
      res.status(500).end();
    });
};

export default theme;
