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
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Column from "./Column";
import { Issue } from "./Issue";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { IssueCardProps } from "../types";
import { getColumns } from "../utils";

export default function Board() {
  const issues = useSelector((state: RootState) => state.issues.issues);
  const owner = useSelector((state: RootState) => state.issues.owner);
  const repo = useSelector((state: RootState) => state.issues.repo);
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const [columns, setColumns] = useState(() => getColumns(issues));
  useEffect(() => {
    setColumns(() => getColumns(issues));
  }, [issues]);

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.entries(columns).map(([status, issues]) => (
          <Column key={status} status={status} issues={issues} />
        ))}
        <DragOverlay>
          {activeId ? (
            <Issue
              {...(issues.find(
                (issue) => issue.id === activeId
              ) as IssueCardProps)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: number) {
    if (id in columns) {
      return id;
    }

    return Object.keys(columns).find((key) =>
      columns[key as keyof typeof columns].some((issue) => issue.id === id)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }
    setColumns((prev) => {
      const activeItems = prev[activeContainer as keyof typeof prev];
      const overItems = prev[overContainer as keyof typeof prev];

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex;
      if (findContainer(overId)) {
        newIndex = overItems.length + 1;
      } else {
        const activeRect =
          active.rect.current?.translated || active.rect.current?.initial;
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          activeRect !== null &&
          activeRect !== undefined &&
          activeRect.top > over.rect.top + over.rect.height;
        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const movedItem = activeItems.find((item) => item.id === activeId);
      if (!movedItem) return prev;

      const updatedItem = {
        ...movedItem,
        state: overContainer === "done" ? "closed" : movedItem.state,
        assignee:
          overContainer === "inProgress"
            ? "-"
            : (movedItem as IssueCardProps).assignee,
      };

      return {
        ...prev,
        [activeContainer]: prev[activeContainer as keyof typeof prev].filter(
          (item) => item.id !== activeId
        ),
        [overContainer]: [
          ...prev[overContainer as keyof typeof prev].slice(0, newIndex),
          updatedItem,
          ...prev[overContainer as keyof typeof prev].slice(
            newIndex,
            prev[overContainer as keyof typeof prev].length
          ),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeContainer = findContainer(activeId) as keyof typeof columns;
    const overContainer = findContainer(overId) as keyof typeof columns;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = columns[activeContainer].findIndex(
      (issue) => issue.id === activeId
    );
    const overIndex = columns[overContainer].findIndex(
      (item) => item.id === overId
    );

    if (activeIndex !== overIndex) {
      setColumns((prev) => ({
        ...prev,
        [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
      }));
    }

    const updatedIssues = [
      ...columns.todo,
      ...columns.inProgress,
      ...columns.done,
    ];

    sessionStorage.setItem(repoUrl, JSON.stringify(updatedIssues));

    setActiveId(null);
  }
}
