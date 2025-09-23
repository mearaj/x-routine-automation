import {takeEvery} from 'redux-saga/effects';
import {globalAppStateActions} from "../slices/globalAppState.ts";
import {startVerifiedByRadioWaterMelonSaga} from "./verifiedByRadioWaterMelon.ts";

export function* watchGlobalAppStateSaga(): Generator {
  yield takeEvery(globalAppStateActions.setVerifiedByRadioWaterMelonState.type, startVerifiedByRadioWaterMelonSaga);
}
