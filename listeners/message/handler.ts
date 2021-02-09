import { restoreUsermetaById } from 'core/firebase/firestore/collections/usermeta';
import { i } from 'core/internationalize';
import { Message } from 'discord.js';
import { failedEmbedGenerator } from 'utils/embed';
import { getPrefix } from 'utils/messages';
import { getDMChannelByUserId, restoreConversations } from './utils';

const messageHandler = async (message: Message) => {
  // Return if message from guild channels
  if (message.guild) return;

  // Initialize values
  const { location } = await restoreUsermetaById(message.author.id);

  const cachedUserConversation = await restoreConversations(message.author.id);
  if (!cachedUserConversation?.activeConversation) {
    message.channel.send(
      failedEmbedGenerator({
        description: i(
          {
            phrase: 'error.not_in_any_conversation',
            locale: location
          },
          getPrefix()
        )
      })
    );
  } else {
    const attachments = message.attachments.array();

    if (attachments.length) {
      const isEveryoneAllowedAttachments =
        cachedUserConversation.activeConversation.allowed_attachments.length >=
        cachedUserConversation.activeConversation.participants.length + 1;

      if (isEveryoneAllowedAttachments) {
        cachedUserConversation.activeConversation?.participants.forEach(
          async participant => {
            const channel = await getDMChannelByUserId(participant);
            if (!channel)
              message.channel.send(
                failedEmbedGenerator({
                  description: i({
                    phrase: 'error.cannot_send_message_to_this_user',
                    locale: location
                  })
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
            description: i(
              {
                phrase: 'error.attachments_acceptance_required',
                locale: location
              },
              getPrefix()
            )
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
                description: i({
                  phrase: 'error.cannot_send_message_to_this_user',
                  locale: location
                })
              })
            );
          channel?.send('\u200B' + message.content.toString());
        }
      );
    }
  }
};

export default messageHandler;
