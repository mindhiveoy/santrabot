import { ChatMessageResponse, Schema } from '@shared/schema';
import admin from '../../admin';

const csv = (req, res, next) => {
  const organizationId = req.params.organizationId;
  let sessionId: string = req.params.sessionId;

  if (sessionId.endsWith('.csv')) {
    const index = sessionId.indexOf('.csv');
    sessionId = sessionId.substring(0, index);
  }

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');

  admin
    .firestore()
    .collection(
      `/${Schema.ORGANIZATIONS}/${organizationId}/${Schema.CHAT_SESSIONS}/${sessionId}/${Schema.CHAT_MESSAGES}`,
    )
    .get()
    .then(snapshot => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');

      res.write('TIME, USER, BOT\n');

      const docs: ChatMessageResponse[] = [];
      snapshot.docs.forEach(doc => docs.push(doc.data() as ChatMessageResponse));

      docs.sort((a, b) => (a.user.date as number) - (b.user.date as number));

      docs.forEach(doc => {
        res.write(`${(doc.user.date as any).toDate()}, ${doc.user.content}, ${doc.bot.content}\n`);
      });
      res.end();
    })
    .catch(error => {
      res.write(error);
      res.status(500).end();
    });
};

export default csv;
