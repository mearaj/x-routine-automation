import {takeEvery} from 'redux-saga/effects';
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";
import {startVerifiedByRadioWaterMelonSaga} from "@/store/sagas/verifiedByRadioWaterMelon.ts";

export function* watchGlobalAppStateSaga(): Generator {
  yield takeEvery(globalAppStateActions.setVerifiedByRadioWaterMelonState.type, startVerifiedByRadioWaterMelonSaga);
}
