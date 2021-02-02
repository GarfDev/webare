import _ from 'lodash';
import getClient from 'core/client';
import { useDispatch, useSelector } from '@hooks';
import { getAllConversationsByParticipantId } from 'core/firebase/firestore/collections/conversation/utils';
import { cacheUserConversation } from 'core/store/actions';
import { selectUserById } from 'core/store/selectors';
import { UserConversationState } from 'core/store/types';

export const restoreConversations = async (userId: string) => {
  // Try to get conversation in redux
  const conversation = useSelector(selectUserById(userId));
  if (conversation) return conversation;
  // Try to get conversation from firestore
  const cachedConversations = await getAllConversationsByParticipantId(userId);
  if (!cachedConversations.length) {
    const dispatch = useDispatch();
    const newUserConversationCached: UserConversationState = {
      activeConversation: null,
      conversations: cachedConversations
    };
    dispatch(cacheUserConversation(userId, newUserConversationCached));
    return undefined;
  }
  // Cache restored conversation to Redux

  const activeConversation = _.cloneDeep(cachedConversations[0]);

  // Remove sender ID from receiver list
  activeConversation.participants = activeConversation?.participants.filter(
    participant => participant !== userId
  );
  const dispatch = useDispatch();
  const newUserConversationCached: UserConversationState = {
    activeConversation,
    conversations: cachedConversations
  };
  dispatch(cacheUserConversation(userId, newUserConversationCached));
  return newUserConversationCached;
};

export const getDMChannelByUserId = async (userId: string) => {
  const user = await getClient().users.fetch(userId);
  return user;
};
