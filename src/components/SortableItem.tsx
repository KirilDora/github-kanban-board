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
  const style = {
    width: "100%",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
    margin: "10px 0",
    background: "white",
    flexDirection: "column",
  };

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
      }}
    >
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
        {state.toUpperCase()}
      </Tag>
    </div>
  );
};

export default function SortableItem(props: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item
        id={props.id}
        title={props.title}
        state={props.state}
        assignee={props.assignee}
      />
    </Card>
  );
}
