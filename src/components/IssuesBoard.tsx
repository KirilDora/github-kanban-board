import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import IssueCard from "./IssueCard";
import { Col, Row } from "antd";
import { useDroppable, DndContext, DragEndEvent } from "@dnd-kit/core";
import { moveIssue } from "../store/issuesSlice";

const IssuesBoard: React.FC = () => {
  const dispatch = useDispatch();
  const issues = useSelector((state: RootState) => state.issues.issues);
  const [columns, setColumns] = useState({
    todo: [] as any[],
    inProgress: [] as any[],
    done: [] as any[],
  });

  useEffect(() => {
    const newColumns = {
      todo: issues.filter((issue) => issue.state === "open" && !issue.assignee),
      inProgress: issues.filter(
        (issue) => issue.state === "open" && issue.assignee
      ),
      done: issues.filter((issue) => issue.state === "closed"),
    };
    setColumns(newColumns);
  }, [issues]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const issueId = Number(active.id.toString().replace("issue-", ""));
    const newStatus = over.id.toString();

    dispatch(moveIssue({ id: issueId, newStatus }));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Row gutter={16}>
        {Object.entries(columns).map(([status, issues]) => (
          <Col span={8} key={status}>
            <StatusColumn status={status} issues={issues} />
          </Col>
        ))}
      </Row>
    </DndContext>
  );
};

interface StatusColumnProps {
  status: string;
  issues: { id: number; title: string; state: string; assignee?: string }[];
}

const StatusColumn: React.FC<StatusColumnProps> = ({ status, issues }) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} style={{ padding: "8px", border: "1px solid #ddd" }}>
      <h3>{status.toUpperCase()}</h3>
      {issues.map((issue) => (
        <IssueCard key={issue.id} {...issue} />
      ))}
    </div>
  );
};

export default IssuesBoard;
