import { Conversation } from 'core/firebase/firestore/collections/conversation';
import { Usermeta } from 'core/firebase/firestore/collections/usermeta';
import CommandListenerMeta from 'types/CommandListenerMeta';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type ApplicationActions = ActionType<typeof actions>;

export interface UserCooldownState {
  [command: string]: number;
}

export interface UsermetaState {
  [userId: string]: Usermeta;
}

export type MatchQueueState = string[];

export interface UserConversationState {
  activeConversation: Conversation | null;
  conversations: Conversation[];
}

export interface UserState {
  [userId: string]: UserConversationState;
}

export interface CooldownState {
  [userId: string]: UserCooldownState;
}

export interface CommandMetaState {
  [key: string]: CommandListenerMeta;
}

export interface MetaDataState {
  commands: CommandMetaState;
  defaultPrefix: string;
  ownerId: string;
}

export interface ApplicationRootState {
  meta: MetaDataState;
  cooldown: CooldownState;
  matchQueue: MatchQueueState;
  usermeta: UsermetaState;
  user: UserState;
}
