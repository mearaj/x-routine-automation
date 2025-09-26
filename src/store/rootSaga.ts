import {all, call} from 'redux-saga/effects';
import {watchUserStateChanges} from './sagas/userSaga';
import {watchAutomatedTasksSaga} from "./sagas/automatatedTasksSaga.ts";
import {loadAppStateFromStorage} from "./sagas/appState.ts";
import {watchGlobalAppStateSaga} from "./sagas/globalAppStateSaga.ts";

export default function* rootSaga() {
  yield call(loadAppStateFromStorage);
  yield all([
    call(watchUserStateChanges),
    call(watchAutomatedTasksSaga),
    call(watchGlobalAppStateSaga)
  ]);
}
