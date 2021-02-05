import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import {
  getDMChannelByUserId,
  restoreConversations
} from 'listeners/message/utils';
import { removeConversationById } from 'core/firebase/firestore/collections/conversation/utils';
import { useDispatch } from '@hooks';
import { removeCachedConversation } from 'core/store/actions';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';

const leave: CommandHandler = async message => {
  const dispatch = useDispatch();
  const conversation = await restoreConversations(message.author.id);

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i('error.not_in_any_conversation')
    });
  }

  await removeConversationById(conversation.activeConversation.id); // Keep this free since we don't need to wait for it
  dispatch(
    removeCachedConversation(
      message.author.id,
      conversation.activeConversation.id
    )
  );

  conversation.activeConversation.participants.forEach(async participant => {
    const user = await getDMChannelByUserId(participant);
    setTimeout(() => {
      user.send(
        successEmbedGenerator({
          description: i('participant_is_ended', getPrefix())
        })
      );
    }, 10);
  });

  return successEmbedGenerator({
    description: i('conversation_is_ended', getPrefix())
  });
};

export default listenerGenerator({
  name: 'leave',
  cooldown: 10,
  queued: true,
  handler: leave,
  dmRequired: true,
  type: ListenerType.GENERAL,
  helpMessage: i('command.leave.short_help'),
  usageMessage: i('command.leave.long_help', getPrefix())
});
