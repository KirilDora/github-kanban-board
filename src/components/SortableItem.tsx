import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Tag } from "antd";
import { IssueCardProps } from "./IssueCard";

export interface ItemCardProps {
  id: number;
  title: string;
  state: string;
  assignee?: string;
}

export const Item: React.FC<ItemCardProps> = ({
  id,
  title,
  state,
  assignee,
}) => {
  const isPlaceholder = 1;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid black",
        margin: "10px 0",
        background: "white",
        flexDirection: "column",
        height: "fit-content",
        padding: "1vw",
      }}
    >
      {isPlaceholder && (
        <>
          {id}
          <p>
            <strong>{title}</strong>
          </p>
          {assignee && (
            <p>
              <strong>Assignee:</strong> {assignee}
            </p>
          )}
          <Tag color={state === "open" ? "blue" : "green"}>
            {state?.toUpperCase()}
          </Tag>
        </>
      )}
    </div>
  );
};

export default function SortableItem(props: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  //if (props.id === -1) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    visibility: props.id === -1 ? ("hidden" as const) : ("visible" as const),
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item {...props} />
    </Card>
  );
}
