import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Issue {
  id: number;
  title: string;
  state: string;
  assignee?: string;
}

interface IssuesState {
  owner: string;
  repo: string;
  issues: Issue[];
}

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
    moveIssue(state, action: PayloadAction<{ id: number; newStatus: string }>) {
      const issue = state.issues.find((i) => i.id === action.payload.id);
      if (issue) {
        issue.state = action.payload.newStatus === "done" ? "closed" : "open";
        issue.assignee =
          action.payload.newStatus === "inProgress" ? "User" : undefined;
      }
    },
  },
});

export const { setRepo, setIssues, moveIssue } = issuesSlice.actions;
export default issuesSlice.reducer;
