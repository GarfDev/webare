import capitalize from 'utils/capitalize';
import getPrefix from './getPrefix';

const isCommand = (message: string): boolean => {
  const prefix = getPrefix();

  return message.startsWith(prefix) || message.startsWith(capitalize(prefix));
};

export default isCommand;
