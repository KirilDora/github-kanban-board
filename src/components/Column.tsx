import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem";

interface ColumnProps {
  status: string;
  issues: { id: number; title: string; state: string; assignee?: string }[];
}

const columnStyle = {
  background: "#dadada",
  padding: 10,
  margin: 10,
  flex: 1,
};

const Column: React.FC<ColumnProps> = ({ status, issues }) => {
  //const { id, items } = props;

  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <SortableContext
      id={status}
      items={issues}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} style={columnStyle}>
        <h2>
          <strong>{status}</strong>
        </h2>
        {issues.map((issue) => (
          <SortableItem key={issue.id} {...issue} />
        ))}
      </div>
    </SortableContext>
  );
};

export default Column;
