import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {Following} from "@/utils/following.ts";

export interface UserState {
  usernames: string[];
  activeUsername: string | null;
  fundraiserURLs: string[];
  fundraiserExcludedURLs: string[];
  followings: Following[];
}

const initialState: UserState = {
  usernames: [],
  activeUsername: null,
  fundraiserURLs: [],
  fundraiserExcludedURLs: [],
  followings: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUsername(state, action: PayloadAction<string>) {
      const username = action.payload.trim();
      if (username && !state.usernames.includes(username)) {
        state.usernames.push(username);
        state.fundraiserURLs = [];
        state.fundraiserExcludedURLs = [];
        state.followings = [];
      }
    },
    setActiveUsername(state, action: PayloadAction<string>) {
      if (state.usernames.includes(action.payload)) {
        state.activeUsername = action.payload;
      }
    },
    removeUsername(state, action: PayloadAction<string>) {
      const removed = action.payload;
      state.usernames = state.usernames.filter((u) => u !== removed);
      state.fundraiserURLs = [];
      state.fundraiserExcludedURLs = [];
      state.followings = [];
      if (state.activeUsername === removed) {
        state.activeUsername = state.usernames[0] || null;
      }
    },
    addFundraiserUrlForActiveUser(state, action: PayloadAction<{ url: string, excluded: boolean }>) {
      const user = state.activeUsername;
      const url = action.payload.url.trim();
      const excluded = action.payload.excluded;
      if (!user || !url) return;
      if (excluded) {
        if (!state.fundraiserExcludedURLs.includes(url)) {
          state.fundraiserExcludedURLs.push(url);
        }
      } else {
        if (!state.fundraiserURLs.includes(url)) {
          state.fundraiserURLs.push(url);
        }
      }
    },
    removeUrlForActiveUser(state, action: PayloadAction<{ url: string, excluded: boolean }>) {
      const user = state.activeUsername;
      const url = action.payload.url.trim();
      const excluded = action.payload.excluded;
      if (!user || !url) return;
       if (excluded) {
        state.fundraiserExcludedURLs = (state.fundraiserExcludedURLs || []).filter((u) => u !== url);
       } else {
        state.fundraiserURLs = (state.fundraiserURLs || []).filter((u) => u !== url);
       }
    },
    setFollowingsForActiveUser(
      state,
      action: PayloadAction<{ followings: Following[] }>
    ) {
      state.followings = action.payload.followings;
    },
    addOrUpdateFollowings(
      state,
      action: PayloadAction<{ followings: Following[] }>
    ) {
      for (const newItem of action.payload.followings) {
        const index = state.followings.findIndex(f => f.username === newItem.username);
        if (index !== -1) {
          state.followings[index] = {...state.followings[index], ...newItem};
        } else {
          state.followings.unshift(newItem);
        }
      }
    },
    resetAllUsers(state) {
      state.usernames = [];
      state.activeUsername = null;
      state.fundraiserURLs = [];
      state.followings = [];
    },
    rehydrateUserState(
      state,
      action: PayloadAction<UserState>
    ) {
      state.usernames = action.payload.usernames;
      state.activeUsername = action.payload.activeUsername;
      state.fundraiserURLs = action.payload.fundraiserURLs ?? [];
      state.fundraiserExcludedURLs = action.payload.fundraiserExcludedURLs ?? [];
      state.followings = action.payload.followings ?? [];
    },
  },
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;

export default userSlice;
