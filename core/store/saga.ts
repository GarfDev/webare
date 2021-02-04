import uniqid from 'uniqid';
import {
  all,
  call,
  put,
  takeLeading,
  takeEvery,
  actionChannel,
  take,
  spawn
} from 'redux-saga/effects';
import { sendMessage } from 'core/client';
import {
  initApplicationSuccess,
  matchCouple,
  matchCoupleSuccess,
  processAsyncCommand,
  processQueuedCommand,
  verifyCommand as verifyCommandAction
} from './actions';
import ActionTypes from './actionTypes';
// Import commands
import { Commands } from 'types';
import {
  fromRootPath,
  backgroundRunnerRegister,
  measureElapsed,
  getLogger
} from 'utils';
import { getCommand, getPrefix } from 'utils/messages';
import { commandListenerRegister } from 'utils/command';
import { useDispatch, useSelector } from '@hooks';
import { selectCommandByName } from './selectors';
import { getConversationCollection } from 'core/firebase/firestore/collections/conversation/utils';
import { Conversation } from 'core/firebase/firestore/collections/conversation';
import { getDMChannelByUserId } from 'listeners/message/utils';
import { successEmbedGenerator } from 'utils/embed';
import { i } from 'core/internationalize';
import messageHandler from 'listeners/message/handler';

function* callMatchCouple({ payload }: ReturnType<typeof matchCouple>) {
  const { firstUser, secUser } = payload;

  // Add new conversation to firestore
  const conversationRef = getConversationCollection();
  const newConversationId = uniqid();
  const newConversation: Conversation = {
    id: newConversationId,
    participants: [firstUser, secUser],
    allowed_attachments: []
  };

  yield conversationRef.doc(newConversationId).set(newConversation);
  // Send message to new user
  const firstUserDM = yield getDMChannelByUserId(firstUser);
  const secUserDM = yield getDMChannelByUserId(secUser);
  yield firstUserDM?.send(
    successEmbedGenerator({
      description: i('matched')
    })
  );
  yield secUserDM?.send(
    successEmbedGenerator({
      description: i('matched')
    })
  );

  yield put(matchCoupleSuccess(newConversationId, firstUser, secUser));
}

function* callInitApplication() {
  const logger = getLogger();
  // Pre-load commands from commands folder
  const measure = measureElapsed();
  yield commandListenerRegister();
  const elapsed = measure();

  logger.info(`Preloaded commands`);
  logger.info(`Take ${elapsed}ms to initialize application`);

  // Register Background Runners
  const backgroundRunnersPath = fromRootPath('runners');
  backgroundRunnerRegister(backgroundRunnersPath);

  yield put(initApplicationSuccess());
}

function commandObjTraveler(
  commands: Commands,
  params: string[]
): [Commands, string[]] {
  let currentDepth = commands;
  const progressedParams = [...params];

  for (let i = 0; i <= params.length; i++) {
    let param = params[i];
    // Handle first param include  //
    // Application prefix          //
    if (i === 0) {
      param = param.replace(getPrefix(), '');
    }
    // Return if cannot find current param
    // In object. And use remain as function param
    // later
    if (!currentDepth[param]) {
      if (i == 0) {
        return [{}, progressedParams];
      }
      break;
    }

    currentDepth = currentDepth[param] as any;
    progressedParams.shift();
  }

  return [currentDepth, progressedParams];
}

/**
 *
 * This saga is run if a message is identified as a valid command.
 *
 */

function* verifyCommand({ payload }: ReturnType<typeof verifyCommandAction>) {
  const { message } = payload;
  ////////////////////////////
  const commands: Commands = yield commandListenerRegister();
  // Process command /////////
  const splicedCommand = message.content.split(' ');
  if (!splicedCommand.length) {
    yield messageHandler(message);
    return;
  }

  const command = getCommand(splicedCommand[0]);
  const [commandToRun, params] = commandObjTraveler(commands, splicedCommand);
  const commandMeta = useSelector(selectCommandByName(command));

  // Run command /////////////
  if (!Object.keys(commandToRun).length && !commandMeta?.name) {
    yield messageHandler(message);
    return;
  }

  if (commandToRun.default && commandToRun.default instanceof Function) {
    const dispatch = useDispatch();
    if (commandMeta.queued) {
      dispatch(
        processQueuedCommand(command, commandToRun.default, message, params)
      );
    } else {
      dispatch(
        processAsyncCommand(command, commandToRun.default, message, params)
      );
    }
  }
}

function* commandRunner({ payload }: ReturnType<typeof processQueuedCommand>) {
  const { name, commandHandler, message, params } = payload;

  const logger = getLogger();
  const start = yield new Date().getTime();
  const result = yield call(commandHandler, message, params);

  // Return response to channel
  if (result) yield call(sendMessage, message.channel.id, result);
  // Monitor execution time for commands
  const elapsed = yield new Date().getTime() - start;
  logger.info(`${name} - ${elapsed}ms`);
}

function* queuedCommandSaga() {
  const channel = yield actionChannel(ActionTypes.RUN_QUEUED_COMMAND);
  while (true) {
    const action = yield take(channel);
    yield commandRunner(action);
  }
}

function* asyncCommandSaga() {
  yield all([takeEvery(ActionTypes.RUN_ASYNC_COMMAND, commandRunner)]);
}

function* rootSaga() {
  yield all([
    takeEvery(ActionTypes.VERIFY_COMMAND, verifyCommand),
    takeLeading(ActionTypes.INIT_APPLICATION, callInitApplication),
    takeEvery(ActionTypes.MATCH_COUPLE, callMatchCouple)
  ]);
  // Spawn Command Handlers
  yield spawn(asyncCommandSaga);
  yield spawn(queuedCommandSaga);
}

export default rootSaga;
