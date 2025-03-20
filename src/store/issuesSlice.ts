import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Issue, IssuesState } from "../types";

const initialState: IssuesState = {
  owner: "",
  repo: "",
  issues: [],
};

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    setRepo(state, action: PayloadAction<{ owner: string; repo: string }>) {
      state.owner = action.payload.owner;
      state.repo = action.payload.repo;
    },
    setIssues(state, action: PayloadAction<Issue[]>) {
      state.issues = action.payload;
    },
  },
});

export const { setRepo, setIssues } = issuesSlice.actions;
export default issuesSlice.reducer;
