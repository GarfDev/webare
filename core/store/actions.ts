import { Message } from 'discord.js';
import { action } from 'typesafe-actions';
import { CommandHandler, CommandListenerMeta } from 'types';
import ActionTypes from './actionTypes';
import { UserConversationState } from './types';
import { Conversation } from 'core/firebase/firestore/collections/conversation';

/**
 * General actions
 */

export const initApplication = () => action(ActionTypes.INIT_APPLICATION);

export const initApplicationSuccess = () =>
  action(ActionTypes.INIT_APPLICATION_SUCCESS);

/**
 * Command actions
 */

export const verifyCommand = (message: Message) =>
  action(ActionTypes.VERIFY_COMMAND, { message });

export const addCommandMeta = (meta: CommandListenerMeta) =>
  action(ActionTypes.ADD_COMMAND_META, { meta });

export const addCooldown = (
  userId: string,
  command: string,
  lastCommandTime: number
) => action(ActionTypes.ADD_COOLDOWN, { userId, command, lastCommandTime });

export const processAsyncCommand = (
  name: string,
  commandHandler: CommandHandler,
  message: Message,
  params: string[]
) =>
  action(ActionTypes.RUN_ASYNC_COMMAND, {
    name,
    commandHandler,
    message,
    params
  });

export const processQueuedCommand = (
  name: string,
  commandHandler: CommandHandler,
  message: Message,
  params: string[]
) =>
  action(ActionTypes.RUN_QUEUED_COMMAND, {
    name,
    commandHandler,
    message,
    params
  });

/**
 * User-Conversation actions
 */

export const cacheUserConversation = (
  userId: string,
  conversation: UserConversationState
) => action(ActionTypes.CACHE_USER_CONVERSATION, { userId, conversation });

export const removeCachedConversation = (
  userId: string,
  conversationId: string
) => action(ActionTypes.REMOVE_CACHED_CONVERSATION, { userId, conversationId });

export const updateCachedConversation = (
  userId: string,
  conversation: Conversation
) => action(ActionTypes.UPDATE_CACHED_CONVERSATION, { userId, conversation });

export const matchCouple = (firstUser: string, secUser: string) =>
  action(ActionTypes.MATCH_COUPLE, { firstUser, secUser });

export const matchCoupleSuccess = (
  id: string,
  firstUser: string,
  secUser: string
) => action(ActionTypes.MATCH_COUPLE_SUCCESS, { id, firstUser, secUser });

export const addUserToMatchQueue = (userId: string) =>
  action(ActionTypes.ADD_USER_TO_MATCH_QUEUE, { userId });

export const removeUserFromMatchQueue = (userId: string) =>
  action(ActionTypes.REMOVE_USER_FROM_MATCH_QUEUE, { userId });

/**
 * Background runner actions
 */
