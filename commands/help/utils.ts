import _ from 'lodash';
import { MessageEmbed } from 'discord.js';
import ListenerType, { ListenerTypeLabel } from 'constants/ListenerType';
import { CommandMetaState } from 'core/store/types';
import Language from 'constants/Language';
import { i } from 'core/internationalize';

export const getCommandMetaByType = (type: ListenerType) => (
  commandMeta: CommandMetaState
) => {
  const filteredCommandMeta: CommandMetaState = {};

  Object.keys(commandMeta).forEach(key => {
    if (commandMeta[key].type === type) {
      filteredCommandMeta[key] = commandMeta[key];
    }
  });

  return filteredCommandMeta;
};

export const addCommandsToEmbed = (
  embed: MessageEmbed,
  type: ListenerType,
  commands: CommandMetaState,
  locate?: Language
): MessageEmbed => {
  const commandsAsString = Object.keys(commands)
    .map(
      key =>
        `**${commands[key].name}**: ${i({
          phrase: commands[key].helpMessage,
          locale: locate
        })}`
    )
    .join('\n');

  if (commandsAsString)
    embed.addField(ListenerTypeLabel[type], commandsAsString);

  return embed;
};
