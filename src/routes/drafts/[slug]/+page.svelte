<script lang="ts">
    import {
        addUnitToXAxis,
        addUnitToYAxis,
        removeUnitFromXAxis,
        removeUnitFromYAxis,
        type BoardItem,
        type DraftUnit,
    } from "$lib/client/db";
    // import * as fakes from "$lib/client/fakes";

    import Button from "$lib/components/Button.svelte";
    import Moodboard from "$lib/components/Moodboard.svelte";
    import TextField from "$lib/components/TextField.svelte";

    import type { PageProps } from "./$types";

    let { data: props }: PageProps = $props();
    let data = $state<DraftUnit[][]>([]);
    let boardItems = $state<BoardItem[]>([]);

    let position = $state({ id: 0, x: 0, y: 0 });
    let isEditMode = $state(false);
    let isMoodboardFocused = $state(false);

    let screenWidth = $state(window.innerWidth);

    const scrollToField = (id: number) => {
        console.log(`id: ${id}`);

        const field = document.getElementById(`field-${id}`);
        const rice = document.getElementById(`rice`);

        if (rice && field) {
            const rect = field.getBoundingClientRect();

            rice.scrollBy({
                left: rect.x - (window.innerWidth / 2 - 545 / 2),
                top: rect.y - 75,
                behavior: "smooth",
            });
        }
    };

    const handleResize = () => (screenWidth = window.innerWidth);

    const handleKeydown = async (ev: KeyboardEvent) => {
        if (ev.key == "Escape") {
            isMoodboardFocused = !isMoodboardFocused;

            const canvas = document.querySelector(
                "#moodboard",
            ) as HTMLCanvasElement;

            if (isMoodboardFocused) {
                canvas.focus();
            } else {
                canvas.blur();
            }
        }

        if (!isEditMode) {
            if (ev.key == "Delete" && data.length >= 1 && data[0].length > 1) {
                if (data[position.x].length > 1) {
                    await removeUnitFromYAxis(
                        props.db,
                        Number.parseInt(props.params!),
                        position,
                    );

                    position.y = !position.y ? position.y : position.y - 1;
                } else {
                    await removeUnitFromXAxis(
                        props.db,
                        Number.parseInt(props.params!),
                        position,
                    );

                    position.x -= 1;
                }

                await gatherData(Number.parseInt(props.params!), 0);

                position.id = data[position.x][position.y].id!;

                scrollToField(position.id);

                return;
            }

            if (
                (ev.key == "ArrowDown" || ev.key == "ArrowRight") &&
                ev.ctrlKey
            ) {
                const draftID = Number.parseInt(props.params!);

                if (ev.key == "ArrowRight") {
                    const id = await addUnitToXAxis(
                        props.db,
                        draftID,
                        position.x,
                    );

                    position = {
                        id: id,
                        x: position.x + 1,
                        y: 0,
                    };
                } else {
                    const id = await addUnitToYAxis(
                        props.db,
                        draftID,
                        position,
                    );

                    position = {
                        id: id,
                        x: position.x,
                        y: position.y + 1,
                    };
                }

                await gatherData(draftID, 0);

                scrollToField(position.id);

                return;
            }

            if (
                ev.key == "ArrowLeft" ||
                ev.key == "ArrowRight" ||
                ev.key == "ArrowUp" ||
                ev.key == "ArrowDown"
            ) {
                ev.preventDefault();

                console.log("pos before: ", $state.snapshot(position));

                let additionX = 0,
                    additionY = 0;

                switch (ev.key) {
                    case "ArrowLeft":
                        additionX = -1;
                        break;
                    case "ArrowRight":
                        additionX = 1;
                        break;
                    case "ArrowUp":
                        additionY = -1;
                        break;
                    case "ArrowDown":
                        additionY = 1;
                        break;
                }

                if (
                    (position.x == 0 && additionX < 0) ||
                    (position.y == 0 && additionY < 0) ||
                    position.x + additionX == data.length ||
                    position.y + additionY == data[position.x].length
                ) {
                    return;
                }

                position.x += additionX;
                position.y += additionY;
                position.id = data[position.x][position.y].id!;

                window.localStorage.setItem(
                    `draft_${props.params}_position`,
                    JSON.stringify(position),
                );

                console.log("pos after: ", $state.snapshot(position));

                scrollToField(position.id);
            }
        }

        // if (
        //     ev.ctrlKey &&
        //     (ev.key == "ArrowLeft" ||
        //         ev.key == "ArrowRight" ||
        //         ev.key == "ArrowUp" ||
        //         ev.key == "ArrowDown")
        // ) {
        // }

        if (ev.altKey && ev.code == "KeyX") {
            isEditMode = !isEditMode;
        }

        // if (ev.altKey && ev.key == "+") {
        //     isAddElementMode = true;
        // }
    };

    const gatherBoardItems = async (draftID: number) => {
        boardItems = await props.db.getAllFromIndex(
            "board",
            "by-parent",
            draftID,
        );

        console.log(boardItems);
    };

    const gatherData = async (draftID: number, xAxis: number) => {
        const res: DraftUnit[][] = [];

        for (let x = 0; x < 9; x++) {
            const tx = props.db.transaction("draftUnits");
            const entry = [];

            for await (const cursor of tx.store
                .index("by-y")
                .iterate(
                    IDBKeyRange.bound([draftID, x, 0], [draftID, x, 256]),
                )) {
                entry.push(cursor.value);
            }

            if (entry.length) {
                res.push(entry);
            } else {
                break;
            }
        }

        data = res;
    };

    $effect(() => {
        if (isEditMode) {
            document.getElementById(`field-${position.id}`)?.focus();
        } else {
            document.getElementById(`field-${position.id}`)?.blur();
        }
    });

    $effect(() => {
        if (props.params && props.params != "new") {
            gatherData(Number.parseInt(props.params), 0).then(() => {
                gatherBoardItems(Number.parseInt(props.params!)).then(() => {
                    const item = window.localStorage.getItem(
                        `draft_${props.params}_position`,
                    );

                    if (item) {
                        position = JSON.parse(item);
                        scrollToField(position.id);
                    }
                });
            });
        }

        window.addEventListener("resize", handleResize);
        document.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div class="max-h-screen">
    <Moodboard
        isFocused={isMoodboardFocused}
        items={boardItems}
        modifier={[
            "absolute left-0 top-0",
            "transition",
            "ease-in-out",
            "duration-400",
            isMoodboardFocused ? "opacity-100" : "opacity-5",
            isMoodboardFocused ? "blur-none" : "blur-xs",
            isMoodboardFocused ? "z-auto" : "z-[-1]",
        ]}
        onSaveData={(id, pos, size) => console.log(`onsave `, pos)}
        onImagePasted={async (file) => {
            const root = await navigator.storage.getDirectory();

            const boardFolder = await root.getDirectoryHandle(
                `board_${props.params}`,
                { create: true },
            );
            const dest = await boardFolder.getFileHandle(
                `${crypto.randomUUID()}`,
                { create: true },
            );

            const stream = await dest.createWritable();

            await stream.write(await file.arrayBuffer());
            await stream.close();

            await props.db.add("board", {
                parent: Number.parseInt(props.params!),
                position: {
                    x: 0,
                    y: 0,
                },
                type: "img",
                data: {
                    opfsPath: `board_${props.params}/${dest.name}`,
                    width: 0,
                    height: 0,
                },
            });

            gatherBoardItems(Number.parseInt(props.params!));
        }}
    />
    <div
        id="rice"
        class:hidden={isMoodboardFocused}
        class="flex overflow-hidden h-[95vh] w-screen"
        style={`padding-bottom: ${window.innerHeight}px`}
    >
        {#each data as entry, entryIndex (entryIndex)}
            <div
                class="flex flex-none h-fit flex-col items-center mb-[50px]"
                style={`margin-left: ${!entryIndex ? screenWidth / 2 - 545 / 2 : 0}px; 
                 margin-right: ${entryIndex == data.length - 1 ? screenWidth / 2 - 545 / 2 : 0}px;`}
            >
                {#each entry as unit (unit.id)}
                    <div class={["flex items-center mt-[10px]"]}>
                        <TextField
                            isDisabled={!isEditMode}
                            id={`field-${unit.id}`}
                            onclick={(ev) => {
                                position = {
                                    id: unit.id!,
                                    x: unit.positionX,
                                    y: unit.positionY,
                                };
                                window.localStorage.setItem(
                                    `draft_${props.params}_position`,
                                    JSON.stringify(position),
                                );

                                scrollToField(unit.id!);
                            }}
                            bind:value={
                                () => unit.text,
                                (v) => {
                                    unit.text = v;
                                    props.db
                                        .put(
                                            "draftUnits",
                                            Object.assign({}, unit),
                                        )
                                        .then((id) => {
                                            if (!unit.id) unit.id = id;
                                        });
                                }
                            }
                        />
                        {#if position.x == unit.positionX && position.y == unit.positionY}
                            <Button
                                click={async () => {
                                    const draftID = Number.parseInt(
                                        props.params!,
                                    );

                                    await addUnitToXAxis(
                                        props.db,
                                        draftID,
                                        position.x,
                                    );

                                    await gatherData(draftID, 0);
                                }}>+</Button
                            >
                        {:else}
                            <div class="w-[45px]"></div>
                        {/if}
                    </div>
                    {#if position.y == unit.positionY && position.x == unit.positionX}
                        <Button
                            modifier={["mt-[7.5px]"]}
                            click={async () => {
                                const draftID = Number.parseInt(props.params!);

                                await addUnitToYAxis(
                                    props.db,
                                    draftID,
                                    position,
                                );

                                await gatherData(draftID, 0);
                            }}>+</Button
                        >
                    {:else}
                        <div class="h-[28px]" />
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>
