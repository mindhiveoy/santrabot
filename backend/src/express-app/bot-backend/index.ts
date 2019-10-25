import { DEFAULT_BOT_NAME, OrganizationId, Schema, Script } from '@shared/schema';
import RiveScript from 'rivescript';
import admin from '../../admin';
import getSessionManager from './session';

export class BotBackend {
  private cachedBots: Map<OrganizationId, any> = new Map();
  // TODO cache flush

  public async answer(organizationId, sessionToken, message): Promise<string> {
    const bot = this.cachedBots.get(organizationId);
    if (bot) {
      console.log(`Bot found from cache ${bot}`);
      const reply = await bot.reply(sessionToken, message);
      console.log(`Bot answered: ${reply}`);
      return reply;
    }

    console.info('Loading scripts for bot');

    const scriptsCollection = await admin
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .doc(organizationId)
      .collection(Schema.BOTS)
      .doc(DEFAULT_BOT_NAME)
      .collection(Schema.SCRIPTS)
      .get();

    if (scriptsCollection.empty) {
      // TODO empty handling
      console.error('No bot scripts defined for organization');
    }

    const scriptFiles: Script[] = [];
    scriptsCollection.forEach(snapshot => {
      scriptFiles.push(snapshot.data() as Script);
    });

    console.info('Initializing bot');

    const riveBot = new RiveScript({
      utf8: true,
      sessionManager: getSessionManager(),
    });
    riveBot.sortReplies.bind(riveBot);
    riveBot.stream.bind(riveBot);
    riveBot.reply.bind(riveBot);

    let script = '';
    for (const scriptFile of scriptFiles) {
      script += scriptFile.data;
    }

    riveBot.stream(script, error => console.error(error));

    console.info('Bot loaded');

    riveBot.sortReplies();

    console.info(`Bot sorted`);
    console.info(`Calling bot`);

    const answer = await riveBot.reply(sessionToken, message, this);
    console.info(`Bot answered ${riveBot}`);

    this.cachedBots.set(organizationId, riveBot as any);
    console.info(`All done`);
    return answer;
  }
}

let backend: BotBackend;

export function getBotBackend(): BotBackend {
  if (backend) {
    return backend;
  }
  backend = new BotBackend();
  return backend;
}

export default getBotBackend;
