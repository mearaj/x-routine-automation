import {all, call} from 'redux-saga/effects';
import {watchUserStateChanges} from './sagas/userSaga';
import {watchAutomatedTasksSaga} from "@/store/sagas/automatatedTasksSaga.ts";
import {loadAppStateFromStorage} from "@/store/sagas/appState.ts";
import {watchGlobalAppStateSaga} from "@/store/sagas/globalAppStateSaga.ts";

export default function* rootSaga() {
  yield all([
    call(loadAppStateFromStorage),
    call(watchUserStateChanges),
    call(watchAutomatedTasksSaga),
    call(watchGlobalAppStateSaga)
  ]);
}
