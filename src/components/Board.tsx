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
import { Item, ItemCardProps } from "./SortableItem";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { IssueCardProps } from "./IssueCard";

const defaultAnnouncements = {
  onDragStart({ active }: any) {
    console.log(`Picked up draggable item ${active.id}.`);
    return `Picked up draggable item ${active.id}.`;
  },
  onDragOver({ active, over }: any) {
    if (over) {
      console.log(
        `Draggable item ${active.id} was moved over droppable area ${over.id}.`
      );
      return `Draggable item ${active.id} was moved over droppable area ${over.id}.`;
    }

    console.log(
      `Draggable item ${active.id} is no longer over a droppable area.`
    );
    return `Draggable item ${active.id} is no longer over a droppable area.`;
  },
  onDragEnd({ active, over }: any) {
    if (over) {
      console.log(
        `Draggable item ${active.id} was dropped over droppable area ${over.id}`
      );
      return `Draggable item ${active.id} was dropped over droppable area ${over.id}`;
    }

    console.log(`Draggable item ${active.id} was dropped.`);
    return `Draggable item ${active.id} was dropped.`;
  },
  onDragCancel({ active }: any) {
    console.log(
      `Dragging was cancelled. Draggable item ${active.id} was dropped.`
    );
    return `Dragging was cancelled. Draggable item ${active.id} was dropped.`;
  },
};

const ensureNotEmpty = (arr: IssueCardProps[]) =>
  arr.length > 0 ? arr : [PLACEHOLDER_ISSUE];

const PLACEHOLDER_ISSUE = { id: -1, title: "", state: "placeholder" };

const getColumns = (issues: IssueCardProps[]) => {
  const mappedIssues = {
    todo: ensureNotEmpty(
      issues.filter((issue) => issue.state === "open" && !issue.assignee)
    ),
    inProgress: ensureNotEmpty(
      issues.filter((issue) => issue.state === "open" && issue.assignee)
    ),
    done: ensureNotEmpty(issues.filter((issue) => issue.state === "closed")),
  };
  console.log("getColumns issues", mappedIssues);
  return mappedIssues;
};

export default function Board() {
  //const dispatch = useDispatch();
  const issues = useSelector((state: RootState) => state.issues.issues);
  const owner = useSelector((state: RootState) => state.issues.owner);
  const repo = useSelector((state: RootState) => state.issues.repo);
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const [columns, setColumns] = useState(() => getColumns(issues));
  useEffect(() => {
    console.log("issues", issues);
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
        accessibility={{ announcements: defaultAnnouncements }}
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
            <Item
              /*id={activeId}*/
              {...(issues.find(
                (issue) => issue.id === activeId
              ) as ItemCardProps)}
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
      if (findContainer(overId) /*overId in prev*/) {
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
      console.log("active Index", activeIndex);
      console.log("active column", activeContainer);
      console.log("over Index", overIndex);
      console.log("over column", overContainer);

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
          // ...(prev[activeContainer as keyof typeof prev].find(
          //   (item) => item.id === activeId
          // )
          //   ? [
          //       prev[activeContainer as keyof typeof prev].find(
          //         (item) => item.id === activeId
          //       )!,
          //     ]
          //   : []),
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

    // Сохраняем в sessionStorage
    sessionStorage.setItem(repoUrl, JSON.stringify(updatedIssues));

    setActiveId(null);
  }
}
