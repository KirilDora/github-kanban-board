import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import IssueCard from "./IssueCard";

interface StatusColumnProps {
  status: string;
  issues: { id: number; title: string; state: string; assignee?: string }[];
}

const StatusColumn: React.FC<StatusColumnProps> = ({ status, issues }) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        background: "#f4f4f4",
        borderRadius: "8px",
        minHeight: "200px",
      }}
    >
      <h3 style={{ textAlign: "center" }}>{status.toUpperCase()}</h3>
      <SortableContext
        items={issues.map((issue) => `issue-${issue.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {issues.map((issue) => (
          <IssueCard key={issue.id} {...issue} />
        ))}
      </SortableContext>
    </div>
  );
};

export default StatusColumn;
