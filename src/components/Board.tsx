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

const wrapperStyle = {
  display: "flex",
  flexDirection: "row",
};

const defaultAnnouncements = {
  onDragStart(id: Number) {
    console.log(`Picked up draggable item ${id}.`);
  },
  onDragOver(id: Number, overId: Number) {
    if (overId) {
      console.log(
        `Draggable item ${id} was moved over droppable area ${overId}.`
      );
      return;
    }

    console.log(`Draggable item ${id} is no longer over a droppable area.`);
  },
  onDragEnd(id: Number, overId: Number) {
    if (overId) {
      console.log(
        `Draggable item ${id} was dropped over droppable area ${overId}`
      );
      return;
    }

    console.log(`Draggable item ${id} was dropped.`);
  },
  onDragCancel(id: Number) {
    console.log(`Dragging was cancelled. Draggable item ${id} was dropped.`);
  },
};

export default function Board() {
  const dispatch = useDispatch();
  const issues = useSelector((state: RootState) => state.issues.issues);

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

  /*const [items, setItems] = useState({
    root: ["1", "2", "3"],
    container1: ["4", "5", "6"],
    container2: ["7", "8", "9"],
    container3: [],
  });*/

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
        {/*<Column status="todo" items={items.root} />
        <Column status="inProgress" items={items.container1} />
        <Column status="done" items={items.container2} />*/}
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
    /*const { active } = event;
    const { id } = active;*/

    setActiveId(event.active.id as number);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over /*draggingRect*/ } = event;
    if (!over) return;
    //const { id } = active;
    //const { id: overId } = over;

    const activeId = active.id as number;
    const overId = over.id as number;

    // Find the containers
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

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex = overIndex >= 0 ? overIndex : overItems.length;
      /*if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }*/

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    //const { id } = active;
    //const { id: overId } = over;
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

    setActiveId(null);
  }
}
