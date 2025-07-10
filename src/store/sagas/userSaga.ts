// userSaga.ts
import {call, put, takeEvery} from 'redux-saga/effects';
import {userActions} from '../slices/userSlice.ts';
import {handleAppStateChange} from "@/store/sagas/appState.ts";
import type {RootState} from "@/store";
import {getAppStateFromStorage} from "@/utils";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";


export function* rehydrateUserOnSwitch() {
  const newState: RootState = yield call(getAppStateFromStorage);

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
  yield takeEvery(userActions.setActiveUsername.type, rehydrateUserOnSwitch);
}
