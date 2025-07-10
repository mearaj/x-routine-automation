// Public saga
import type {RootState} from "@/store";
import {call, put, select} from "redux-saga/effects";
import {getAppStateFromStorage, saveAppStateToStorage} from "@/utils";
import {userActions} from "@/store/slices/userSlice.ts";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";

export function* loadAppStateFromStorage(): Generator {
  const storedState: RootState = yield call(getAppStateFromStorage);
  yield put(userActions.rehydrateUserState(storedState.user));
  yield put(automatedTasksActions.rehydrateAutomationState(storedState.automatedTasks));
}

// Handle save
export function* handleAppStateChange(): Generator {
  const state: RootState = yield select();
  yield call(saveAppStateToStorage, state);
}
