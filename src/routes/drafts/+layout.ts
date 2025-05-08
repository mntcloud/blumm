// deno-lint-ignore-file no-fallthrough
import type { BlumDB } from "$lib/client/db";
import type { LayoutLoad } from "./$types";
import { openDB } from "idb";

export const ssr = false;

export const load: LayoutLoad = async ({ params }) => {
  const db = await openDB<BlumDB>("system", 3, {
    blocked() {
      alert("reload page to update db connection, please");
    },
    upgrade(db, oldVersion, _new, transaction) {
      switch (oldVersion) {
        case 0: {
          db.createObjectStore("drafts", {
            keyPath: "id",
            autoIncrement: true,
          });

          const units = db.createObjectStore("draftUnits", {
            keyPath: "id",
            autoIncrement: true,
          });

          units.createIndex("by-x", ["parent", "positionX"], { unique: false });
          units.createIndex("by-y", ["parent", "positionX", "positionY"], {
            unique: false,
          });
          units.createIndex("by-parent", "parent", { unique: false });
        }
        case 1:
          db.createObjectStore("board", {
            keyPath: "id",
            autoIncrement: true,
          });
        case 2:
          transaction.objectStore("board")
            .createIndex("by-parent", "parent", { unique: false })
      }
    },
  });

  console.log("invoked layout!");

  return {
    db,
    params: params.slug,
  };
};
