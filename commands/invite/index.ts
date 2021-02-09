import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { successEmbedGenerator } from 'utils/embed';
import { i } from 'core/internationalize';

const invite: CommandHandler = async () => {
  return successEmbedGenerator({
    title: i('command.invite.click_here_to_invite'),
    url: 'https://bit.ly/webare'
  });
};

export default listenerGenerator({
  name: 'invite',
  cooldown: 10,
  queued: true,
  handler: invite,
  type: ListenerType.GENERAL,
  helpMessage: 'command.invite.short_help',
  usageMessage: 'command.invite.long_help'
});
