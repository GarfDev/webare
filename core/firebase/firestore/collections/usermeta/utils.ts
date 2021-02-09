import { useDispatch, useSelector } from '@hooks';
import { getFirebase } from 'core/firebase';
import { cacheUsermeta } from 'core/store/actions';
import { selectUsermetaById } from 'core/store/selectors';
import { initialUsermeta, USERMETA } from './constants';
import { Usermeta } from './types';

const getUsermetaCollection = () => {
  return getFirebase().firestore().collection(USERMETA);
};

export const restoreUsermetaById = async (
  userId: string
): Promise<Usermeta> => {
  // Try to get from Redux store
  const usermeta = useSelector(selectUsermetaById(userId));
  if (usermeta) return usermeta;
  // Try to get from firestore if there no data cached
  // And Cache them to Redux
  const dispatch = useDispatch();
  const result = (await getUsermetaCollection().doc(userId).get()).data();
  // Initialize Usermeta when cannot found in both Redux and Firestore
  if (!result) {
    const initializeResult = await initializeUsermeta(userId);
    dispatch(cacheUsermeta(userId, initializeResult));
    return initializeResult;
  }

  dispatch(cacheUsermeta(userId, (result as unknown) as Usermeta));
  return (result as unknown) as Usermeta;
};

export const initializeUsermeta = async (userId: string) => {
  const usermetaRef = getUsermetaCollection();
  await usermetaRef.doc(userId).set(initialUsermeta);
  return initialUsermeta;
};

export const updateUsermetaById = async (userId: string, meta: Usermeta) => {
  const usermetaCollectionRef = getUsermetaCollection();
  await usermetaCollectionRef.doc(userId).set(meta);
  // Cache changes to store
  const dispatch = useDispatch();
  dispatch(cacheUsermeta(userId, meta));
};
