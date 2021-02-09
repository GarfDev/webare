import * as Yup from 'yup';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import {
  restoreUsermetaById,
  updateUsermetaById
} from 'core/firebase/firestore/collections/usermeta';
import Language from 'constants/Language';
import { i } from 'core/internationalize';

const language: CommandHandler = async (message, params) => {
  // Check if params is correct
  const usermeta = await restoreUsermetaById(message.author.id);
  if (Object.values(Language).includes(params[0] as any)) {
    usermeta.location = params[0] as Language;
    await updateUsermetaById(message.author.id, usermeta);
    return successEmbedGenerator({
      description: i(
        {
          phrase: 'command.set.language.success',
          locale: usermeta.location
        },
        usermeta.location
      )
    });
  }
  return failedEmbedGenerator({
    description: i({
      phrase: 'command.set.language.cannot_identify',
      locale: usermeta.location
    })
  });
};

export default listenerGenerator({
  name: 'language',
  cooldown: 10,
  queued: true,
  handler: language,
  type: ListenerType.GENERAL,
  helpMessage: 'command.set.language.short_help',
  usageMessage: 'command.set.language.long_help',
  validationSchema: Yup.array().min(1).max(1)
});
