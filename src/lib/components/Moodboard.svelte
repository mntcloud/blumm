<script lang="ts">
    import type { BoardItem } from "$lib/client/db";
    import type { MouseEventHandler } from "svelte/elements";
    import { scale } from "svelte/transition";

    let comp: HTMLCanvasElement;

    const {
        items,
        modifier,
        onImagePasted,
        onSaveData,
        isFocused,
    }: {
        items: BoardItem[];
        modifier: string[];
        onImagePasted: (file: File) => void;
        onSaveData: (
            id: number,
            pos: { x: number; y: number },
            size: { w: number; h: number },
        ) => void;
        isFocused: boolean;
    } = $props();

    const cachedImages = $state<
        {
            meta: {
                id: number;
                position: { x: number; y: number };
                size: { w: number; h: number };
            };
            bitmap: ImageBitmap;
        }[]
    >([]);

    let captured = $state<{
        state: "move" | "resize" | "nothing";
        id: number;
        offsetX: number;
        offsetY: number;
        diffSize: { h: number; w: number };
    }>();
    let position = $state<{ x: number; y: number }>({ x: 0, y: 0 });
    let zoom = $state({ scale: 1 });

    const drawOnCanvas = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // NOTE: we need this to make work our zoom (scale) work,
        //       it saves state at default scale and then we can
        //       set a new scale, a sum of previous scale value
        //       and deltaY divisioned by choosen speed,
        //       that can be reviewed in the debugging stage
        ctx.save();

        ctx.scale(zoom.scale, zoom.scale);

        for (const img of cachedImages) {
            ctx.save();

            let x = img.meta.position.x;
            let y = img.meta.position.y;

            let w = img.meta.size.w;
            let h = img.meta.size.h;

            if (captured && captured.id == img.meta.id) {
                x += captured.offsetX;
                y += captured.offsetY;

                const percentage = (captured.diffSize.w * captured.diffSize.h) / (w * h) 

                w += w * (captured.diffSize.w < 0 ? -percentage : percentage);
                h += h * (captured.diffSize.w < 0 ? -percentage : percentage);

                console.log(w, h)
            }

            ctx.beginPath();
            ctx.roundRect(x - position.x, y - position.y, w, h, 4);

            ctx.clip();

            ctx.drawImage(img.bitmap, x - position.x, y - position.y, w, h);

            ctx.restore();

            if (captured && captured.id == img.meta.id) {
                ctx.strokeStyle = "#38f";
                ctx.lineWidth = 3;

                ctx.beginPath();

                ctx.roundRect(x - position.x, y - position.y, w, h, 4);

                ctx.stroke();
            }
        }

        ctx.restore();
    };

    const handleResize = (ev: UIEvent) => {
        (comp.width = window.innerWidth), (comp.height = window.innerHeight);

        drawOnCanvas(comp.getContext("2d")!);
    };

    const handleClipboardPaste = (ev: ClipboardEvent) => {
        if (ev.clipboardData && isFocused) {
            for (const item of ev.clipboardData.items) {
                console.log(item.type);

                if (item.type.indexOf("image") != -1) {
                    const blob = item.getAsFile();

                    console.log(blob);

                    if (blob) {
                        onImagePasted(blob);
                    }
                }
            }
        }
    };

    const cacheImages = async () => {
        const root = await navigator.storage.getDirectory();
        console.log(items);

        for (const item of items) {
            if (
                "opfsPath" in item.data &&
                !cachedImages.find((val) => val.meta.id == item.id)
            ) {
                const path = item.data.opfsPath.split("/");

                const boardFolder = await root.getDirectoryHandle(path[0]);
                const img = await boardFolder.getFileHandle(path[1]);

                const bitmap = await createImageBitmap(await img.getFile());

                cachedImages.push({
                    meta: {
                        id: item.id!,
                        position: item.position,
                        size: {
                            w: item.data.width ? item.data.width : bitmap.width,
                            h: item.data.height
                                ? item.data.height
                                : bitmap.height,
                        },
                    },
                    bitmap: bitmap,
                });
            }
        }
    };

    $effect(() => {
        if (captured) {
            drawOnCanvas(comp.getContext("2d")!);
        }
    });

    $effect(() => {
        if (items) {
            cacheImages().then(() => {
                drawOnCanvas(comp.getContext("2d")!);
            });
        }
    });

    $effect(() => {
        if (position && zoom) {
            drawOnCanvas(comp.getContext("2d")!);
        }
    });

    $effect(() => {
        const ctx = comp.getContext("2d")!;

        ctx.imageSmoothingEnabled = false;

        window.addEventListener("resize", handleResize);
        document.addEventListener("paste", handleClipboardPaste);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("paste", handleClipboardPaste);

            for (const img of cachedImages) {
                img.bitmap.close();
            }
        };
    });
</script>

<canvas
    id="moodboard"
    class={["bg-stone-50 dark:bg-stone-950", "size-full", ...modifier]}
    onmousemove={(ev) => {
        if (captured) {
            switch (captured.state) {
                case "move":
                    captured.offsetX += ev.movementX + (zoom.scale != 1.0 ? (ev.movementX * (1.0 + (1.0 - zoom.scale))) : 0);
                    captured.offsetY += ev.movementY + (zoom.scale != 1.0 ? (ev.movementY * (1.0 + (1.0 - zoom.scale))) : 0);
                    break;
                case "resize":
                    captured.diffSize = {
                        w: captured.diffSize.w + ev.movementX,
                        h: captured.diffSize.h + ev.movementY,
                    };
                    console.log(`after resize: `, $state.snapshot(captured.diffSize))
                    break;
            }
        }
    }}
    onmousedown={(ev) => {
        captured = undefined;

        for (const img of cachedImages) {
            const pos = {
                min: {
                    x: (img.meta.position.x - position.x) * zoom.scale,
                    y: (img.meta.position.y - position.y) * zoom.scale,
                },
                max: {
                    x: (img.meta.position.x - position.x + img.meta.size.w) * zoom.scale,
                    y: (img.meta.position.y - position.y + img.meta.size.h) * zoom.scale,
                },
            };

            if (
                pos.min.x <= ev.clientX &&
                ev.clientX <= pos.max.x &&
                pos.min.y <= ev.clientY &&
                ev.clientY <= pos.max.y
            ) {
                let state: "move" | "resize" = "move";

                if (
                    ((ev.clientX - pos.min.x <= 20 ||
                        pos.max.x - ev.clientX <= 20) &&
                        pos.max.y - ev.clientY <= 20) ||
                    ((ev.clientX - pos.min.x <= 20 ||
                        pos.max.x - ev.clientX <= 20) &&
                        ev.clientY - pos.min.y <= 20)
                ) {
                    state = "resize";
                }

                captured = {
                    state: state,
                    id: img.meta.id,
                    offsetX: 0,
                    offsetY: 0,
                    diffSize: { w: 0, h: 0 },
                };
            }
        }
    }}
    onmouseup={(ev) => {
        if (captured) {
            const item = cachedImages.find(
                (img) => img.meta.id == captured!.id,
            );

            if (item) {
                item.meta.position.x += captured.offsetX;
                item.meta.position.y += captured.offsetY;

               
                const percentage = (captured.diffSize.w * captured.diffSize.h) / (item.meta.size.w * item.meta.size.h) 

                item.meta.size.w += item.meta.size.w * (captured.diffSize.w < 0 ? -percentage : percentage);
                item.meta.size.h += item.meta.size.h * (captured.diffSize.w < 0 ? -percentage : percentage); 

                onSaveData(item.meta.id, item.meta.position, item.meta.size);
            }

            captured = {
                state: "nothing",
                id: captured.id,
                offsetX: 0,
                offsetY: 0,
                diffSize: { w: 0, h: 0 },
            };
        }
    }}
    onwheel={(ev) => {
        ev.preventDefault();

        if (ev.ctrlKey) {
            zoom = { scale: zoom.scale - ev.deltaY / 100 };
            position = {
                x: Math.min(position.x - ev.clientX * (ev.deltaY / 100), ev.clientX),
                y: Math.min(position.y - ev.clientY * (ev.deltaY / 100), ev.clientY)
            }
        } else {
            position = {
                x: position.x + Math.floor(ev.deltaX),
                y: position.y + Math.floor(ev.deltaY),
            };
        }

        console.log(position)
    }}
    bind:this={comp}
    width={window.innerWidth}
    height={window.innerHeight}
>
</canvas>
