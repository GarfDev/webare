import getFirebase from 'core/firebase/getFirebase';
import { CONVERSATION } from './constants';
import { Conversation } from './types';

export const getConversationCollection = () => {
  return getFirebase().firestore().collection(CONVERSATION);
};

export const getConversation = (id: string) =>
  getConversationCollection().doc(id);

export const getAllConversationsByParticipantId = async (id: string) => {
  const result = await getConversationCollection()
    .where('participants', 'array-contains', id)
    .get();

  return (result.docs.map(data => data.data()) as unknown) as Conversation[];
};

export const removeConversationById = async (id: string) => {
  const conversationRef = getConversationCollection();
  await conversationRef.doc(id).delete();
};

export const updateConversationById = (id: string) => (
  newConversation: Conversation
) => {
  const conversation = getConversation(id);
  conversation.set(newConversation);
};
