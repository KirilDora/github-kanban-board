import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { moveIssue } from "../store/issuesSlice";
import StatusColumn from "./StatusColumn";
import IssueCard, { IssueCardProps } from "./IssueCard";
import { Col, Row } from "antd";

const IssuesBoard: React.FC = () => {
  const dispatch = useDispatch();
  const issues = useSelector((state: RootState) => state.issues.issues);
  console.log("issues");
  console.log(issues);

  const [columns, setColumns] = useState({
    todo: issues.filter((issue) => issue.state === "open" && !issue.assignee),
    inProgress: issues.filter(
      (issue) => issue.state === "open" && issue.assignee
    ),
    done: issues.filter((issue) => issue.state === "closed"),
  });

  useEffect(() => {
    setColumns((prev) => ({
      ...prev,
      todo: issues.filter((issue) => issue.state === "open" && !issue.assignee),
      inProgress: issues.filter(
        (issue) => issue.state === "open" && issue.assignee
      ),
      done: issues.filter((issue) => issue.state === "closed"),
    }));
  }, [issues]);
  console.log("columns");
  console.log(columns);

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumn = (id: number) => {
    return Object.keys(columns).find((key) =>
      columns[key as keyof typeof columns].some((issue) => issue.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragOver = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(Number(active.id));
    const overColumn = findColumn(Number(over.id));

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumns((prev) => {
      if (!activeColumn || !overColumn) return prev;

      const activeIssues = prev[activeColumn as keyof typeof prev].filter(
        (issue) => issue.id !== active.id
      );
      const overIssues = [
        ...prev[overColumn as keyof typeof prev],
        prev[activeColumn as keyof typeof prev].find(
          (issue) => issue.id === active.id
        ),
      ];

      return {
        ...prev,
        [activeColumn]: activeIssues,
        [overColumn]: overIssues,
      };
    });

    dispatch(moveIssue({ id: Number(active.id), newStatus: overColumn }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const column = findColumn(Number(active.id)) as keyof typeof columns;
    if (!column) return;

    const activeIndex = columns[column].findIndex(
      (issue) => issue.id === active.id
    );
    const overIndex = columns[column].findIndex(
      (issue) => issue.id === over.id
    );

    if (activeIndex !== overIndex) {
      setColumns((prev) => ({
        ...prev,
        [column]: arrayMove(prev[column], activeIndex, overIndex),
      }));
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Row gutter={16}>
        {Object.entries(columns).map(([status, issues]) => (
          <Col span={8} key={status}>
            <StatusColumn status={status} issues={issues} />
          </Col>
        ))}
      </Row>
      <DragOverlay>
        {activeId ? (
          issues.find((issue) => issue.id === activeId) ? (
            <IssueCard
              {...(issues.find(
                (issue) => issue.id === activeId
              ) as IssueCardProps)}
            />
          ) : null
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default IssuesBoard;
