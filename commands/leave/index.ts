import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import {
  getDMChannelByUserId,
  restoreConversations
} from 'listeners/message/utils';
import { selectUserById } from 'core/store/selectors';
import { useSelector } from '@hooks';
import { removeConversationById } from 'core/firebase/firestore/collections/conversation/utils';

const leave: CommandHandler = async message => {
  await restoreConversations(message.author.id);
  const conversation = useSelector(selectUserById(message.author.id));

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: "You're not in any conversation"
    });
  }

  conversation.activeConversation.participants.forEach(async participant => {
    const user = await getDMChannelByUserId(participant);
    setTimeout(() => {
      user.send('**Your partner is leaving the chat..**');
    }, 100);
  });

  removeConversationById(conversation.activeConversation.id); // Keep this free since we don't need to wait for it
  return successEmbedGenerator({
    description: '**This conversation is ended..**'
  });
};

export default listenerGenerator({
  name: 'leave',
  cooldown: 10,
  queued: true,
  handler: leave,
  type: ListenerType.DEVELOPER,
  helpMessage: 'This command to leave voice channel (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)'
});
