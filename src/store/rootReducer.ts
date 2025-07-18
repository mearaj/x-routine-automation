import { combineReducers } from '@reduxjs/toolkit';
import {userReducer} from "./slices/userSlice.ts";
import {automatedTasksReducer} from "@/store/slices/automatedTasks.ts";
import {globalAppStateReducer} from "@/store/slices/globalAppState.ts";

const rootReducer = combineReducers({
  user: userReducer,
  automatedTasks:automatedTasksReducer,
  globalAppState: globalAppStateReducer,
});

export default rootReducer;
