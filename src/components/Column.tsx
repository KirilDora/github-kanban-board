import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "./SortableIssue";
import { ColumnProps } from "../types";
import { columnStyle } from "../styles";

const Column: React.FC<ColumnProps> = ({ status, issues }) => {
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
        <h2>{status.toUpperCase()}</h2>
        {issues.map((issue) => (
          <SortableItem key={issue.id} {...issue} />
        ))}
      </div>
    </SortableContext>
  );
};

export default Column;
