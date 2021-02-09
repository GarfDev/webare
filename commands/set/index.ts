import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'set',
  cooldown: 10,
  queued: true,
  type: ListenerType.GENERAL,
  helpMessage: 'command.set.short_help',
  usageMessage: 'command.set.long_help'
});
