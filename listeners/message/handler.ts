import { Message } from 'discord.js';
import { getDMChannelByUserId, restoreConversations } from './utils';

const messageHandler = async (message: Message) => {
  if (message.guild) return;
  const cachedUserConversation = await restoreConversations(message.author.id);
  if (!cachedUserConversation?.activeConversation) {
    message.channel.send('There no conversation found');
  } else {
    const attachments = message.attachments.array();

    if (attachments.length) {
      const isEveryoneAllowedAttachments =
        cachedUserConversation.activeConversation.allowed_attachments.length ===
        cachedUserConversation.activeConversation.participants.length + 1;

      if (isEveryoneAllowedAttachments) {
        cachedUserConversation.activeConversation?.participants.forEach(
          async participant => {
            const channel = await getDMChannelByUserId(participant);
            if (!channel)
              message.channel.send('Cannot send message to this user');
            channel?.send(message.content, {
              files: attachments
            });
          }
        );
      } else {
        message.channel.send('Everyone much accept attachments first.');
      }
    } else {
      cachedUserConversation.activeConversation?.participants.forEach(
        async participant => {
          const channel = await getDMChannelByUserId(participant);
          if (!channel)
            message.channel.send('Cannot send message to this user');
          channel?.send(message.content);
        }
      );
    }
  }
};

export default messageHandler;
