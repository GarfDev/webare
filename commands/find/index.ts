import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { useDispatch, useSelector } from '@hooks';
import { addUserToMatchQueue } from 'core/store/actions';
import { restoreConversations } from 'listeners/message/utils';
import { selectMatchQueue } from 'core/store/selectors';

const find: CommandHandler = async message => {
  const dispatch = useDispatch();

  const conversation = await restoreConversations(message.author.id);

  if (conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: 'You already in a conversation'
    });
  }

  const matchQueue = useSelector(selectMatchQueue);

  if (matchQueue.includes(message.author.id)) {
    return failedEmbedGenerator({
      description: 'Still finding partner for you..'
    });
  }

  dispatch(addUserToMatchQueue(message.author.id));

  return successEmbedGenerator({
    description: `Added you to job queue`
  });
};

export default listenerGenerator({
  name: 'find',
  cooldown: 10,
  queued: true,
  handler: find,
  type: ListenerType.GENERAL,
  helpMessage: 'This command return a pong when you call it (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)',
  dmRequired: true
});
