import type { IDBPDatabase } from "idb";
import type { BlumDB } from "$lib/client/db";

export const isEnabled = true;

const SAMPLE_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Aliquam rhoncus, dui sit amet varius posuere, ante est rutrum massa, id eleifend augue eros eu enim. 
Nulla eget velit lorem. Donec viverra est velit, sed faucibus turpis cursus vulputate. 
Maecenas suscipit lectus a enim rutrum, vitae commodo leo laoreet. Nullam at ultricies elit. 
Proin ac arcu in felis aliquam luctus quis ut nibh. 
Nullam porttitor dignissim laoreet. In nisi augue, sagittis et iaculis a, pretium id ex. 
Praesent aliquam risus nec nibh mollis euismod. Ut elementum, diam quis pharetra luctus, sem orci vulputate metus, vel aliquet est est ut urna. 
Nullam tempus congue nibh, non semper neque consequat a. Mauris suscipit euismod ex, vitae condimentum nunc accumsan vitae. 
Integer lectus nisl, elementum quis sem vel, tempus mattis diam. Fusce semper velit ut egestas gravida. 
Vestibulum purus ipsum, facilisis at turpis et, consequat pellentesque augue. 
Quisque in leo vel libero efficitur porttitor et in metus. `;

export async function populate(db: IDBPDatabase<BlumDB>) {
  (await db.getAllFromIndex("draftUnits", "by-parent", 1)).forEach((unit) =>
    db.delete("draftUnits", unit.id!)
  );

  for (let i = 0; i < 100; i++) {
    let day = "21"

    if (i < 25) {
        day = "22"
    } else if (i < 50) {
        day = "23"
    } else if (i < 75) {
        day = "24"
    } else {
        day = "25"
    }

    await db.add("draftUnits", {
      text: SAMPLE_TEXT,
      date: Date.parse(`2025-04-${day}`),
      parent: 1,
      positionY: i,
      positionX: 0,
    });
  }

  for (let i = 0; i < 100; i++) {
    let day = "21"

    if (i < 25) {
        day = "22"
    } else if (i < 50) {
        day = "23"
    } else if (i < 75) {
        day = "24"
    } else {
        day = "25"
    }

    await db.add("draftUnits", {
      text: SAMPLE_TEXT,
      date: Date.parse(`2025-04-${day}`),
      parent: 1,
      positionY: i,
      positionX: 1,
    });
  }

 for (let i = 0; i < 100; i++) {
    let day = "21"

    if (i < 25) {
        day = "22"
    } else if (i < 50) {
        day = "23"
    } else if (i < 75) {
        day = "24"
    } else {
        day = "25"
    }

    await db.add("draftUnits", {
      text: SAMPLE_TEXT,
      date: Date.parse(`2025-04-${day}`),
      parent: 1,
      positionY: i,
      positionX: 2,
    });
  }
}
