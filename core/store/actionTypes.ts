enum ActionTypes {
  INIT_APPLICATION = '@core/store/INIT_APPLICATION',
  INIT_APPLICATION_SUCCESS = '@core/store/INIT_APPLICATION_SUCCESS',
  ADD_COMMAND_META = '@core/store/ADD_COMMAND_META',
  // Prepaid command before run it
  VERIFY_COMMAND = '@core/store/VERIFY_COMMAND',
  // Run command in different mode
  RUN_ASYNC_COMMAND = '@core/store/RUN_ASYNC_COMMAND',
  RUN_QUEUED_COMMAND = '@core/store/RUN_QUEUED_COMMAND',
  // User-Conversation
  MATCH_COUPLE = '@core/store/MATCH_COUPLE',
  MATCH_COUPLE_SUCCESS = '@core/store/MATCH_COUPLE_SUCCESS',
  CACHE_USER_CONVERSATION = '@core/store/CACHE_USER_CONVERSATION',
  ADD_USER_TO_MATCH_QUEUE = '@core/store/ADD_USER_TO_MATCH_QUEUE',
  REMOVE_CACHED_CONVERSATION = '@core/store/REMOVE_CACHED_CONVERSATION',
  // Cooldown actions
  ADD_COOLDOWN = '@core/store/UPDATE_COOLDOWN'
}

export default ActionTypes;
