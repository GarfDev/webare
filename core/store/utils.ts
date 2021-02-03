import _ from 'lodash';
import { Conversation } from 'core/firebase/firestore/collections/conversation';
import { UserConversationState } from './types';

export const updateUserConversationState = (
  oldUserConversationState: UserConversationState,
  conversationWithoutOwnerId: Conversation,
  conversationWithOwnerId: Conversation
): UserConversationState => {
  const newUserConversationState = _.cloneDeep(oldUserConversationState);

  // Check and update if conversation to update
  // is current active conversation
  const isCurrentConversation =
    newUserConversationState.activeConversation?.id ===
    conversationWithoutOwnerId.id;
  if (isCurrentConversation) {
    newUserConversationState.activeConversation = conversationWithoutOwnerId;
  }

  // Find item index using _.findIndex
  const conversationIndex = _.findIndex(
    newUserConversationState.conversations,
    { id: conversationWithOwnerId.id }
  );
  // Replace item at index using native splice
  newUserConversationState.conversations.splice(
    conversationIndex,
    1,
    conversationWithOwnerId
  );

  return newUserConversationState;
};
