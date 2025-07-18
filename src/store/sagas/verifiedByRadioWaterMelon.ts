import type {PayloadAction} from "@reduxjs/toolkit";
import {type VerifiedByRadioWaterMelonState} from "@/utils/automatedTasks.ts";
import {call, put, select} from "redux-saga/effects";
import {verifiedByRadioWaterMelonSelector} from "@/store/selectors.ts";
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";
import {fetchVerifiedByRadioWaterMelonUsers} from "@/utils/globalState.ts";

export function* startVerifiedByRadioWaterMelonSaga(action: PayloadAction) {
  if (action.type !== globalAppStateActions.setVerifiedByRadioWaterMelonState.type) {
    return;
  }
  const verifiedByRadioWaterMelonState: VerifiedByRadioWaterMelonState = yield select(verifiedByRadioWaterMelonSelector);
  if (verifiedByRadioWaterMelonState.state !== "loading") {
    return;
  }
  const currentVerifiedData = new Set<string>([...verifiedByRadioWaterMelonState.data]);
  try {
    const newVerifiedData: Set<string> = yield call(fetchVerifiedByRadioWaterMelonUsers);
    for (const username of newVerifiedData) {
      currentVerifiedData.add(username);
    }
    yield put(globalAppStateActions.setVerifiedByRadioWaterMelonState({
      state: "success",
      data: currentVerifiedData,
    }));
  } catch (error) {
    console.log(error);
    yield put(globalAppStateActions.setVerifiedByRadioWaterMelonState({
      state: "error",
      data: currentVerifiedData
    }));
    return;
  }
}
