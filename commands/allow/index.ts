import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import {
  getDMChannelByUserId,
  restoreConversations
} from 'listeners/message/utils';
import { updateConversationById } from 'core/firebase/firestore/collections/conversation/utils';
import { Conversation } from 'core/firebase/firestore/collections/conversation';
import { updateCachedConversation } from 'core/store/actions';
import { useDispatch } from '@hooks';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';

const allow: CommandHandler = async message => {
  const dispatch = useDispatch();
  const conversation = await restoreConversations(message.author.id);

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i('error.not_in_any_conversation')
    });
  } else {
    const isAlreadyAllowedAttachments = conversation.activeConversation.allowed_attachments.includes(
      message.author.id
    );

    if (isAlreadyAllowedAttachments) {
      return failedEmbedGenerator({
        description: i('command.allow.already_allowed_attachments')
      });
    }

    const allowedAttachments =
      (conversation.activeConversation?.allowed_attachments.length || 0) + 1;

    const totalParticipants =
      (conversation.activeConversation?.participants.length || 0) + 1;

    conversation.activeConversation.participants.forEach(async participant => {
      const user = await getDMChannelByUserId(participant);

      if (allowedAttachments < totalParticipants) {
        setTimeout(() => {
          user.send(
            successEmbedGenerator({
              description: i(
                'command.allow.partner_allowed_attachments',
                allowedAttachments.toString(),
                totalParticipants.toString()
              )
            })
          );
        }, 100);
      } else {
        setTimeout(() => {
          user.send(
            successEmbedGenerator({
              description: i('command.allow.activated_attachments')
            })
          );
        }, 100);
      }
    });

    const newConversationObj = conversation.conversations.find(
      item => item.id === conversation.activeConversation?.id
    ) as Conversation;
    newConversationObj.allowed_attachments.push(message.author.id);

    updateConversationById(newConversationObj.id)(newConversationObj);
    dispatch(updateCachedConversation(message.author.id, newConversationObj));

    if (allowedAttachments < totalParticipants) {
      return successEmbedGenerator({
        description: i(
          'command.allow.partner_allowed_attachments',
          allowedAttachments.toString(),
          totalParticipants.toString()
        )
      });
    }
    return successEmbedGenerator({
      description: i('command.allow.activated_attachments')
    });
  }
};

export default listenerGenerator({
  name: 'allow',
  cooldown: 10,
  queued: true,
  handler: allow,
  type: ListenerType.GENERAL,
  helpMessage: i('command.allow.short_help'),
  usageMessage: i('command.allow.long_help', getPrefix())
});
