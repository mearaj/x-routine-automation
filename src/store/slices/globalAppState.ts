import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type GlobalAppState, type VerifiedByRadioWaterMelonState,} from "@/utils/automatedTasks.ts";


const initialState: GlobalAppState = {
  verifiedByRadioWaterMelonState: {
    data: new Set<string>(),
    state: "idle",
  }
}

const globalAppState = createSlice({
  name: 'globalAppState',
  initialState,
  reducers: {
    setVerifiedByRadioWaterMelonState: (state: GlobalAppState, action: PayloadAction<VerifiedByRadioWaterMelonState>) => {
      state.verifiedByRadioWaterMelonState = action.payload;
    }
  },
});

export const globalAppStateReducer = globalAppState.reducer;
export const globalAppStateActions = globalAppState.actions;

export default globalAppState;
