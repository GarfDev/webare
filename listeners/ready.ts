import { useDispatch } from '@hooks';
import getClient from 'core/client';
import { initApplication } from 'core/store/actions';
import { getPrefix } from 'utils/messages';

async function onReady(): Promise<void> {
  const client = getClient();
  const dispatch = useDispatch();
  dispatch(initApplication());
  client.user?.setActivity(`with ${getPrefix()}find`, {});
}

export default onReady;
