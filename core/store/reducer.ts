import _ from 'lodash';
import { Conversation } from 'core/firebase/firestore/collections/conversation';
import ActionTypes from './actionTypes';
import {
  ApplicationRootState,
  ApplicationActions,
  CommandMetaState,
  MetaDataState,
  UserConversationState,
  UserState
} from './types';

const initialRootState: ApplicationRootState = {
  user: {},
  cooldown: {},
  matchQueue: [],
  meta: {
    commands: {},
    defaultPrefix: process.env.DEFAULT_PREFIX || '',
    ownerId: process.env.ADMINISTRATOR || ''
  }
};

const rootReducer = (
  state = initialRootState,
  action: ApplicationActions
): ApplicationRootState => {
  switch (action.type) {
    /**
     * This action register command meta
     * information to global application state
     * to reuse later.
     */
    case ActionTypes.ADD_COMMAND_META: {
      // Destructor Params
      const { meta } = action.payload;
      const { name } = meta;
      // New Command Meta State Object
      const newCommandMetaState: CommandMetaState = {
        ...(state.meta.commands || {}),
        [name]: meta
      };
      // New Meta State Object
      const metaState: MetaDataState = {
        ...(state.meta || {}),
        commands: newCommandMetaState
      };
      // Action return
      return {
        ...state,
        meta: metaState
      };
    }
    /**
     * COOLDOWN CASE
     */
    case ActionTypes.ADD_COOLDOWN: {
      const { userId, lastCommandTime, command } = action.payload;

      return {
        ...state,
        cooldown: {
          ...state.cooldown,
          [userId]: {
            [command]: lastCommandTime
          }
        }
      };
    }
    /**
     * USER-CONVERSATION CASES
     */
    case ActionTypes.CACHE_USER_CONVERSATION: {
      const { userId, conversation } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          [userId]: conversation
        }
      };
    }
    ///
    case ActionTypes.ADD_USER_TO_MATCH_QUEUE: {
      const { userId } = action.payload;
      return {
        ...state,
        matchQueue: [...state.matchQueue, userId]
      };
    }
    //
    case ActionTypes.MATCH_COUPLE_SUCCESS: {
      const { id, firstUser, secUser } = action.payload;

      const newConversation: Conversation = {
        id,
        participants: [firstUser, secUser],
        allowed_attachments: []
      };

      const newFirstUserConversation: Conversation = {
        id,
        participants: [secUser],
        allowed_attachments: []
      };

      const newSecUserConversation: Conversation = {
        id,
        participants: [firstUser],
        allowed_attachments: []
      };

      const newFirstUserConversationState: UserConversationState = {
        activeConversation: newFirstUserConversation,
        conversations: [newConversation]
      };

      const newSecUserConversationState: UserConversationState = {
        activeConversation: newSecUserConversation,
        conversations: [newConversation]
      };

      // Add new conversation to cached
      return {
        ...state,
        matchQueue: state.matchQueue.filter(
          id => !(id === firstUser || id === secUser)
        ),
        user: {
          ...state.user,
          [firstUser]: newFirstUserConversationState,
          [secUser]: newSecUserConversationState
        }
      };
    }
    //
    case ActionTypes.REMOVE_CACHED_CONVERSATION: {
      const { userId, conversationId } = action.payload;

      const newUserState: UserState = _.cloneDeep(state.user);
      const cachedUserConversation = newUserState[userId];

      // Remove this conversation for participants
      cachedUserConversation.activeConversation?.participants.forEach(
        async participant => {
          const cachedParticipantConversation = newUserState[participant];
          if (!cachedParticipantConversation) return;

          cachedParticipantConversation.conversations = cachedParticipantConversation.conversations.filter(
            conversation => conversation.id !== conversationId
          );

          if (!cachedParticipantConversation.conversations.length) {
            cachedParticipantConversation.activeConversation = null;
          } else {
            const isCurrentConversation =
              cachedParticipantConversation.activeConversation?.id ===
              conversationId;

            if (isCurrentConversation) {
              cachedParticipantConversation.activeConversation =
                cachedParticipantConversation.conversations[0];
            }
          }
          newUserState[participant] = cachedParticipantConversation;
        }
      );

      // Remove this conversation for current user
      cachedUserConversation.conversations = cachedUserConversation.conversations.filter(
        conversation => conversation.id !== conversationId
      );

      if (!cachedUserConversation.conversations.length) {
        cachedUserConversation.activeConversation = null;
      } else {
        const isCurrentConversation =
          cachedUserConversation.activeConversation?.id === conversationId;

        if (isCurrentConversation) {
          cachedUserConversation.activeConversation =
            cachedUserConversation.conversations[0];
        }
      }
      newUserState[userId] = cachedUserConversation;
      // Return new state
      return {
        ...state,
        user: newUserState
      };
    }
    //
    case ActionTypes.UPDATE_CACHED_CONVERSATION: {
      const { userId, conversation } = action.payload;

      const newUserState: UserState = _.cloneDeep(state.user);
      const newUserConversation = newUserState[userId];

      newUserConversation.conversations = newUserConversation.conversations.filter(
        cachedConversation => cachedConversation.id !== conversation.id
      );
      newUserConversation.conversations.push(conversation);

      const isCurrentConversation =
        newUserConversation.activeConversation?.id === conversation.id;

      if (isCurrentConversation) {
        newUserConversation.activeConversation = {
          id: conversation.id,
          participants: conversation.participants.filter(
            item => item !== userId
          ),
          allowed_attachments: conversation.allowed_attachments
        };
      }

      // Update changes to all cached participants
      conversation.participants.forEach(async participant => {
        const participantConversation = newUserState[participant];

        const isCurrentConversation =
          participantConversation.activeConversation?.id === conversation.id;

        if (isCurrentConversation) {
          participantConversation.activeConversation = {
            id: conversation.id,
            participants: conversation.participants.filter(
              item => item !== participant
            ),
            allowed_attachments: conversation.allowed_attachments
          };
        }
      });

      // Return state
      return {
        ...state,
        user: newUserState
      };
    }
    //
    default: {
      return state;
    }
  }
};

export default rootReducer;
