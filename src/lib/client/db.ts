import type { DBSchema, IDBPDatabase } from "idb";

export interface DraftUnit {
  id?: number;

  text: string;

  date: number;

  parent: number;
  positionY: number;
  positionX: number;
}

export interface Draft {
  id?: number,
  emoji: string
  name: string
}

export interface BoardItem {
  id?: number
  parent: number
  position: {x: number, y: number} 
  type: "img" | "text" | "marking"
  data: ImageData | TextData | MarkingData
}

export interface ImageData {
  opfsPath: string
  width: number
  height: number
}

export interface TextData {
  text: string
  font: string 
}

export interface MarkingData {
  color: string
  points: {x: number, y: number}[]
}

export interface BlumDB extends DBSchema {
  board: {
    key: number;
    indexes: {
      "by-parent": number;
    }
    value: BoardItem 
  },
  drafts: {
    key: number;
    value: Draft;
  };
  draftUnits: {
    key: number;
    indexes: {
      "by-x": [number, number];
      "by-y": [number, number, number];
      "by-parent": number;
    };
    value: DraftUnit;
  };
}

export async function removeUnitFromXAxis(
  db: IDBPDatabase<BlumDB>,
  draftID: number,
  current: { id: number, x: number; y: number },
) { 
  await db.delete("draftUnits", current.id);

  const tx = db.transaction(
    "draftUnits",
    "readwrite",
    { durability: "relaxed" },
  );

  for await (
    const cursor of tx.store
      .index("by-parent")
      .iterate(draftID)
  ) {
    const unit = { ...cursor.value };

    if (unit.positionX > current.x) {
      unit.positionX -= 1;

      cursor.update(unit);
    }
  }

  await tx.done;
}

export async function removeUnitFromYAxis(
  db: IDBPDatabase<BlumDB>,
  draftID: number,
  current: { id: number, x: number; y: number },
) {
  await db.delete("draftUnits", current.id);

  const tx = db.transaction(
    "draftUnits",
    "readwrite",
    { durability: "relaxed" },
  );

  for await (
    const cursor of tx.store
      .index("by-x")
      .iterate([draftID, current.x])
  ) {
    const unit = { ...cursor.value };

    if (unit.positionY > current.y) {
      unit.positionY -= 1;

      cursor.update(unit);
    }
  }

  await tx.done;
}

export async function addUnitToYAxis(
  db: IDBPDatabase<BlumDB>,
  draftID: number,
  current: { x: number; y: number },
): Promise<number> {
  const tx = db.transaction(
    "draftUnits",
    "readwrite",
    { durability: "relaxed" },
  );

  const t0 = performance.now();

  for await (
    const cursor of tx.store
      .index("by-x")
      .iterate([draftID, current.x])
  ) {
    const unit = { ...cursor.value };

    if (unit.positionY >= current.y + 1) {
      unit.positionY += 1;

      cursor.update(unit);
    }
  }

  await tx.done;

  return await db.add("draftUnits", {
    text: "",
    date: Date.now(),
    parent: draftID,
    positionX: current.x,
    positionY: current.y + 1,
  });
}

export async function addUnitToXAxis(
  db: IDBPDatabase<BlumDB>,
  draftID: number,
  currentX: number,
): Promise<number> {
  const tx = db.transaction(
    "draftUnits",
    "readwrite",
    { durability: "relaxed" },
  );

  const t0 = performance.now();

  for await (
    const cursor of tx.store
      .index("by-parent")
      .iterate(draftID)
  ) {
    const unit = { ...cursor.value };

    if (unit.positionX >= currentX + 1) {
      unit.positionX += 1;

      cursor.update(unit);
    }
  }

  const t1 = performance.now();

  await tx.done;

  console.log(`transaction time: ${t1 - t0}`);

  return await db.add("draftUnits", {
    text: "",
    date: Date.now(),
    parent: draftID,
    positionX: currentX + 1,
    positionY: 0,
  });
}
