import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { useDispatch } from '@hooks';
import { addUserToMatchQueue } from 'core/store/actions';
import { restoreConversations } from 'listeners/message/utils';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';
import { restoreUsermetaById } from 'core/firebase/firestore/collections/usermeta';

const find: CommandHandler = async message => {
  const dispatch = useDispatch();

  const conversation = await restoreConversations(message.author.id);
  const { location } = await restoreUsermetaById(message.author.id);

  if (conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i(
        {
          phrase: 'command.find.error.already_in_conversation',
          locale: location
        },
        getPrefix()
      )
    });
  }

  dispatch(addUserToMatchQueue(message.author.id));

  return successEmbedGenerator({
    description: i(
      { phrase: 'command.find.successfully_started', locale: location },
      getPrefix()
    )
  });
};

export default listenerGenerator({
  name: 'find',
  cooldown: 10,
  queued: true,
  handler: find,
  type: ListenerType.GENERAL,
  helpMessage: 'command.find.short_help',
  usageMessage: 'command.find.long_help',
  dmRequired: true
});
