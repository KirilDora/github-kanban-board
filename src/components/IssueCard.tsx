import React from "react";
import { Card, Tag } from "antd";
import { useDraggable } from "@dnd-kit/core";

export interface IssueCardProps {
  id: number;
  title: string;
  state: string;
  assignee?: string;
}

const IssueCard: React.FC<IssueCardProps> = ({
  id,
  title,
  state,
  assignee,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `issue-${id}`,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <Card ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <p>
        <strong>{title}</strong>
      </p>
      {assignee && (
        <p>
          <strong>Assignee:</strong> {assignee}
        </p>
      )}
      <Tag color={state === "open" ? "blue" : "green"}>
        {state.toUpperCase()}
      </Tag>
    </Card>
  );
};

export default IssueCard;
