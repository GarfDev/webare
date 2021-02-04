import { TextChannel, User } from 'discord.js';
import { getDMChannelByUserId, restoreConversations } from './message/utils';

const onTypingStart = async (channel: TextChannel, user: User) => {
  // Ignore all Typing from guilds
  if (channel.guild) return;
  const conversation = await restoreConversations(user.id);
  // Return if no conversation for this user
  if (!conversation) return;
  if (!conversation.activeConversation) return;

  conversation.activeConversation.participants.forEach(async participant => {
    const partner = await getDMChannelByUserId(participant);
    if (!partner.dmChannel) return;
    partner.dmChannel.startTyping();
    setTimeout(() => {
      partner.dmChannel?.stopTyping(true);
    }, 1000);
  });
};

export default onTypingStart;
