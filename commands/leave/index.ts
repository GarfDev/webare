import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator } from 'utils/embed';
import {
  getDMChannelByUserId,
  restoreConversations
} from 'listeners/message/utils';
import { removeConversationById } from 'core/firebase/firestore/collections/conversation/utils';
import { useDispatch, useSelector } from '@hooks';
import {
  removeCachedConversation,
  removeUserFromMatchQueue
} from 'core/store/actions';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';
import { selectMatchQueue } from 'core/store/selectors';

const leave: CommandHandler = async message => {
  const dispatch = useDispatch();
  const matchQueue = useSelector(selectMatchQueue);
  const conversation = await restoreConversations(message.author.id);
  const isOnMatchQueue = matchQueue.includes(message.author.id);

  if (isOnMatchQueue) {
    const dispatch = useDispatch();
    dispatch(removeUserFromMatchQueue(message.author.id));
    return failedEmbedGenerator({
      description: i('command.leave.stop_matching_successfully')
    });
  }

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i('error.not_in_any_conversation', getPrefix())
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
        failedEmbedGenerator({
          description: i('participant_is_ended', { prefix: getPrefix() })
        })
      );
    }, 10);
  });

  return failedEmbedGenerator({
    description: i('conversation_is_ended', { prefix: getPrefix() })
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
