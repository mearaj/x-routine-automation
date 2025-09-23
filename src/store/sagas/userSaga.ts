import { call, put, takeEvery } from 'redux-saga/effects';
import { userActions } from '../slices/userSlice.ts';
import { automatedTasksActions } from "../slices/automatedTasks.ts";
import { handleAppStateChange } from "./appState.ts";
import { getAppStateFromStorage } from "../../utils";
import type { RootState } from "../store.ts";

function* saveAndSwitchUser() {
  yield* handleAppStateChange(); // Save current state

  const newState: RootState = yield call(getAppStateFromStorage); // Load new state
  yield put(userActions.rehydrateUserState(newState.user));
  yield put(automatedTasksActions.rehydrateAutomationState(newState.automatedTasks));
}

export function* watchUserStateChanges(): Generator {
  yield takeEvery([
    userActions.addUsername.type,
    userActions.removeUsername.type,
    userActions.resetAllUsers.type,
    userActions.addFundraiserUrlForActiveUser.type,
    userActions.removeUrlForActiveUser.type,
    userActions.setFollowingsForActiveUser.type,
    userActions.addOrUpdateFollowings.type,
  ], handleAppStateChange);

  yield takeEvery(userActions.setActiveUsername.type, saveAndSwitchUser);
}
