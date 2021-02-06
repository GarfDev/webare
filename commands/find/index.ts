import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { useDispatch } from '@hooks';
import { addUserToMatchQueue } from 'core/store/actions';
import { restoreConversations } from 'listeners/message/utils';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';

const find: CommandHandler = async message => {
  const dispatch = useDispatch();

  const conversation = await restoreConversations(message.author.id);

  if (conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i('command.find.error.already_in_conversation', getPrefix())
    });
  }

  dispatch(addUserToMatchQueue(message.author.id));

  return successEmbedGenerator({
    description: i('command.find.successfully_started', getPrefix())
  });
};

export default listenerGenerator({
  name: 'find',
  cooldown: 10,
  queued: true,
  handler: find,
  type: ListenerType.GENERAL,
  helpMessage: i('command.find.short_help'),
  usageMessage: i('command.find.long_help', getPrefix()),
  dmRequired: true
});
