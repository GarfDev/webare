import { i } from 'core/internationalize';
import { Message } from 'discord.js';
import { failedEmbedGenerator } from 'utils/embed';
import { getPrefix } from 'utils/messages';
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
              message.channel.send(
                failedEmbedGenerator({
                  description: i('error.cannot_send_message_to_this_user')
                })
              );
            channel?.send(message.content.toString(), {
              files: attachments
            });
          }
        );
      } else {
        message.channel.send(
          failedEmbedGenerator({
            description: i('error.attachments_acceptance_required', getPrefix())
          })
        );
      }
    } else {
      cachedUserConversation.activeConversation?.participants.forEach(
        async participant => {
          const channel = await getDMChannelByUserId(participant);
          if (!channel)
            message.channel.send(
              failedEmbedGenerator({
                description: i('error.cannot_send_message_to_this_user')
              })
            );
          channel?.send(message.content.toString());
        }
      );
    }
  }
};

export default messageHandler;
