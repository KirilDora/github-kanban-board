export interface Issue {
  id: number;
  title: string;
  state: string;
  assignee?: string;
}

export type IssuesByRepo = Record<string, Issue[]>;

export interface IssuesState {
  owner: string;
  repo: string;
  issues: Issue[];
}

export interface ColumnProps {
  status: string;
  issues: { id: number; title: string; state: string; assignee?: string }[];
}

export interface IssueCardProps {
  id: number;
  title: string;
  state: string;
  assignee?: string;
}
