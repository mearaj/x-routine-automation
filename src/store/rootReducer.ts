import { combineReducers } from '@reduxjs/toolkit';
import {userReducer} from "./slices/userSlice.ts";
import {automatedTasksReducer} from "@/store/slices/automatedTasks.ts";

const rootReducer = combineReducers({
  user: userReducer,
  automatedTasks:automatedTasksReducer,
});

export default rootReducer;
