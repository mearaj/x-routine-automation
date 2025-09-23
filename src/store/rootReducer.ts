import { combineReducers } from '@reduxjs/toolkit';
import {userReducer} from "./slices/userSlice.ts";
import {automatedTasksReducer} from "./slices/automatedTasks.ts";
import {globalAppStateReducer} from "./slices/globalAppState.ts";

const rootReducer = combineReducers({
  user: userReducer,
  automatedTasks:automatedTasksReducer,
  globalAppState: globalAppStateReducer,
});

export default rootReducer;
