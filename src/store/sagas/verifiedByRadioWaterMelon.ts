import type {PayloadAction} from "@reduxjs/toolkit";
import {type VerifiedByRadioWaterMelonState} from "../../utils/automatedTasks.ts";
import {call, put, select} from "redux-saga/effects";
import {verifiedByRadioWaterMelonSelector} from "../selectors.ts";
import {globalAppStateActions} from "../slices/globalAppState.ts";
import {fetchVerifiedByRadioWaterMelonUsers} from "../../utils/globalState.ts";

export function* startVerifiedByRadioWaterMelonSaga(action: PayloadAction) {
  if (action.type !== globalAppStateActions.setVerifiedByRadioWaterMelonState.type) {
    return;
  }

  const verifiedByRadioWaterMelonState: VerifiedByRadioWaterMelonState = yield select(verifiedByRadioWaterMelonSelector);
  if (verifiedByRadioWaterMelonState.state !== "loading") {
    return;
  }

  // Ensure we start from a plain array (serializable) and use a local Set only for dedupe.
  const existingArr: string[] = Array.isArray(verifiedByRadioWaterMelonState.data)
    ? verifiedByRadioWaterMelonState.data
    : [];

  const dedupeSet = new Set<string>(existingArr);

  try {
    const fetchedSet: Set<string> = yield call(fetchVerifiedByRadioWaterMelonUsers);

    if (fetchedSet && typeof fetchedSet[Symbol.iterator] === "function") {
      for (const username of fetchedSet) {
        dedupeSet.add(username);
      }
    }

    const mergedArr = Array.from(dedupeSet); // <- serializable

    yield put(globalAppStateActions.setVerifiedByRadioWaterMelonState({
      state: "success",
      data: mergedArr,
    }));
  } catch (error) {
    console.log(error);
    const fallbackArr = Array.from(dedupeSet);
    yield put(globalAppStateActions.setVerifiedByRadioWaterMelonState({
      state: "error",
      data: fallbackArr,
    }));
    return;
  }
}
