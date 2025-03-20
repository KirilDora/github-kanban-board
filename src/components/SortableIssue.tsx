import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "antd";
import { IssueCardProps } from "../types";
import Item from "./Issue";

export default function SortableIssue(props: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

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
