import React from "react";
import { IssueCardProps } from "../types";
import { itemStyle } from "../styles";
import { Tag } from "antd";

export const Issue: React.FC<IssueCardProps> = ({
  id,
  title,
  state,
  assignee,
}) => {
  return (
    <div style={itemStyle}>
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
    </div>
  );
};

export default Issue;
