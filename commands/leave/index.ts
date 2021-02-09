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
import { restoreUsermetaById } from 'core/firebase/firestore/collections/usermeta';

const leave: CommandHandler = async message => {
  const dispatch = useDispatch();
  const matchQueue = useSelector(selectMatchQueue);
  const conversation = await restoreConversations(message.author.id);
  const isOnMatchQueue = matchQueue.includes(message.author.id);
  const { location } = await restoreUsermetaById(message.author.id);

  if (isOnMatchQueue) {
    const dispatch = useDispatch();
    dispatch(removeUserFromMatchQueue(message.author.id));
    return failedEmbedGenerator({
      description: i({
        phrase: 'command.leave.stop_matching_successfully',
        locale: location
      })
    });
  }

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i(
        { phrase: 'error.not_in_any_conversation', locale: location },
        getPrefix()
      )
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
          description: i(
            { phrase: 'participant_is_ended', locale: location },
            { prefix: getPrefix() }
          )
        })
      );
    }, 10);
  });

  return failedEmbedGenerator({
    description: i(
      { phrase: 'conversation_is_ended', locale: location },
      { prefix: getPrefix() }
    )
  });
};

export default listenerGenerator({
  name: 'leave',
  cooldown: 10,
  queued: true,
  handler: leave,
  dmRequired: true,
  type: ListenerType.GENERAL,
  helpMessage: 'command.leave.short_help',
  usageMessage: 'command.leave.long_help'
});
