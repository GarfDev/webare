import { useSelector } from '@hooks';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { getConversationCollection } from 'core/firebase/firestore/collections/conversation/utils';
import { selectMatchQueue } from 'core/store/selectors';
import { successEmbedGenerator } from 'utils/embed';

const report: CommandHandler = async () => {
  const matchQueue = useSelector(selectMatchQueue);
  const conversationRef = getConversationCollection();

  return successEmbedGenerator({
    description: `**Reported in ${new Date().toTimeString()}**
        Current Match Queue: **${matchQueue.length}**
        Active Conversations: **${(await conversationRef.get()).docs.length}**
        Active User: **${
          (await conversationRef.get()).docs.length * 2 + matchQueue.length
        }**
        `
  });
};

export default listenerGenerator({
  name: 'report',
  cooldown: 10,
  queued: true,
  handler: report,
  type: ListenerType.DEVELOPER,
  helpMessage: 'This command return current state of the bot (Developer only)',
  usageMessage: 'This command return current state of the bot (Developer only)'
});
