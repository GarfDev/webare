import { capitalize } from '..';
import getPrefix from './getPrefix';

const getCommand = (command: string): string =>
  command.replace(getPrefix(), '').replace(capitalize(getPrefix()), '');

export default getCommand;
