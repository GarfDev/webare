import _ from 'lodash';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import {
  getDMChannelByUserId,
  restoreConversations
} from 'listeners/message/utils';
import { addIdToAcceptedAttachments } from 'core/firebase/firestore/collections/conversation/utils';
import { Conversation } from 'core/firebase/firestore/collections/conversation';
import { updateCachedConversation } from 'core/store/actions';
import { useDispatch } from '@hooks';
import { i } from 'core/internationalize';
import { getPrefix } from 'utils/messages';
import { restoreUsermetaById } from 'core/firebase/firestore/collections/usermeta';

const allow: CommandHandler = async message => {
  const dispatch = useDispatch();
  let conversation = await restoreConversations(message.author.id);
  const { location } = await restoreUsermetaById(message.author.id);

  if (!conversation?.activeConversation) {
    return failedEmbedGenerator({
      description: i(
        {
          phrase: 'error.not_in_any_conversation',
          locale: location
        },
        getPrefix()
      )
    });
  } else {
    const isAlreadyAllowedAttachments = conversation.activeConversation.allowed_attachments.includes(
      message.author.id
    );

    if (isAlreadyAllowedAttachments) {
      return failedEmbedGenerator({
        description: i({
          phrase: 'command.allow.already_allowed_attachments',
          locale: location
        })
      });
    }

    const allowedAttachments =
      conversation.activeConversation.allowed_attachments.length + 1;

    const totalParticipants =
      (conversation.activeConversation.participants.length || 0) + 1;

    conversation.activeConversation.participants.forEach(async participant => {
      const user = await getDMChannelByUserId(participant);

      if (allowedAttachments < totalParticipants) {
        setTimeout(() => {
          user.send(
            successEmbedGenerator({
              description: i(
                {
                  phrase: 'command.allow.partner_allowed_attachments',
                  locale: location
                },
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
              description: i({
                phrase: 'command.allow.activated_attachments',
                locale: location
              })
            })
          );
        }, 100);
      }
    });

    conversation = await restoreConversations(message.author.id);
    const newConversationObj = _.cloneDeep(
      conversation?.conversations.find(
        item => item.id === conversation?.activeConversation?.id
      ) as Conversation
    );
    if (!newConversationObj) return;

    newConversationObj.allowed_attachments = [
      ...newConversationObj.allowed_attachments,
      message.author.id
    ];

    addIdToAcceptedAttachments(newConversationObj.id, message.author.id);
    dispatch(updateCachedConversation(message.author.id, newConversationObj));

    if (allowedAttachments < totalParticipants) {
      return successEmbedGenerator({
        description: i(
          {
            phrase: 'command.allow.user_allowed_attachments',
            locale: location
          },
          allowedAttachments.toString(),
          totalParticipants.toString()
        )
      });
    }
    return successEmbedGenerator({
      description: i({
        phrase: 'command.allow.activated_attachments',
        locale: location
      })
    });
  }
};

export default listenerGenerator({
  name: 'allow',
  cooldown: 10,
  queued: true,
  handler: allow,
  dmRequired: true,
  type: ListenerType.GENERAL,
  helpMessage: 'command.allow.short_help',
  usageMessage: 'command.allow.long_help'
});
