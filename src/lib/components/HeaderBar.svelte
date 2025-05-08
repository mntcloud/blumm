<script lang="ts">
    import type { Draft } from "$lib/client/db";
    import { onMount } from "svelte";
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import type { MouseEventHandler } from "svelte/elements";

    let {
        edit = false,
        selected = 0,
        drafts = [],
        handleClick,
        handleNew,
        handleEsc,
        handleDelete,
        handleDoneOnEdit,
    }: {
        edit: boolean;
        selected: number;
        drafts: Draft[];
        handleClick: (id: number) => void;
        handleNew: () => void;
        handleEsc: () => void;
        handleDelete: (id: number) => void;
        handleDoneOnEdit: (name: string, emoji: string) => void;
    } = $props();

    let container: HTMLElement;

    const focusOnSelected = (id: number) => {
        const sel = container.querySelector(`#draft-${id}`);
        const listing = container.querySelector("#listing");

        if (sel && listing) {
            const listingRect = listing.getBoundingClientRect();
            const rect = sel.getBoundingClientRect();

            const result = rect.x - listingRect.x - (250 / 2 - rect.width / 2);
            console.log(result);
            listing.scrollBy({ left: result, top: 0, behavior: "smooth" });
        }
    };

    let tooltip = $state({
        x: 0,
        y: 0,
    });

    const handleTooltipDelete: MouseEventHandler<HTMLButtonElement> = () => {
        tooltip = {x: 0, y: 0}
        handleDelete(selected)
    }

    const handleTooltipEdit: MouseEventHandler<HTMLButtonElement> = (ev) => {
        tooltip = {x: 0, y: 0}

        if (!edit) {
            const sel = container.querySelector(`#draft-${selected}`)!;

            editedEmoji =
                sel.querySelector("span:first-child")!.textContent;
            editedName =
                sel.querySelector("span:last-child")!.textContent;
        } else {
            editedEmoji = null;
            editedName = null;
        }

        edit = !edit;
    }

    const handleContextMenu: MouseEventHandler<HTMLButtonElement> = (ev) => {
        ev.preventDefault();

        if (!tooltip.x && !tooltip.y) {
            const selectedRect = container
                .querySelector(`#draft-${selected} > span:last-child`)
                ?.getBoundingClientRect();
            const tooltipRect = document
                .getElementById("tooltip")
                ?.getBoundingClientRect();

            if (selectedRect && tooltipRect) {
                tooltip.y = selectedRect.y + selectedRect.height + 7.5;
                tooltip.x = selectedRect.x + selectedRect.width / 2 - 50;
            }
        } else {
            tooltip.x = 0 
            tooltip.y = 0
        }
    };

    let editedEmoji = $state<string | null>(null);
    let editedName = $state<string | null>(null);

    $effect(() => {
        console.log(edit);
        focusOnSelected(selected);

        if (edit) {
        }
    });

    $effect(() => {
        console.log(drafts);

        if (drafts.length) {
            focusOnSelected(selected);
        }
    });
</script>

<div
    class="relative z-[3] w-full flex px-[5px] py-[10px] justify-center items-center"
    bind:this={container}
>
    {#if edit}
        <Button
            click={() => {
                edit = false;
                editedEmoji = null;
                editedName = null;

                handleEsc();
            }}>Esc</Button>
    {/if}
    <div id="listing" class="flex w-[250px] h-[28px] overflow-x-hidden">
        {#if drafts.length}
            {#each drafts as draft, index (draft.id)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <button
                    role="tab"
                    tabindex={index}
                    onclick={() => {
                        if (!edit) handleClick(draft.id!);
                    }}
                    oncontextmenu={handleContextMenu}
                    id={`draft-${draft.id}`}
                    class={[
                        selected != draft.id ? "opacity-50" : "",
                        "min-w-fit",
                        "flex-none",
                    ]}
                    style={`
                        margin-left: ${!index ? 250 : 5}px; 
                        margin-right: ${index == drafts.length - 1 ? 250 : 5}px`}
                >
                    {#if edit && selected == draft.id}
                        <Input
                            bind:value={editedEmoji}
                            modifier={["w-[28px]", "h-[28px]", "mx-[5px]"]}
                            type="text"
                            placeholder="🤔"
                        />
                        <Input
                            bind:value={editedName}
                            modifier={["w-[110px]"]}
                            type="text"
                            placeholder="name"
                        />
                    {:else}
                        <span class={["font-semibold text-sm"]}>
                            {draft.emoji}
                        </span>
                        <span class={["font-semibold", "text-sm"]}>
                            {draft.name}
                        </span>
                    {/if}
                </button>
            {/each}
        {:else}
            <div>
                <span class={["dark:opacity-75", "font-semibold text-sm"]}
                    >⛔</span
                >
                <span class={"font-medium dark:text-stone-500 text-sm"}
                    >No draft</span
                >
            </div>
        {/if}
    </div>
    <Button
        modifier={["mt-0"]}
        click={edit
            ? () => {
                  handleDoneOnEdit(editedName!, editedEmoji!);
                  editedEmoji = null
                  editedName = null
                  edit = false;
              }
            : handleNew}
    >
        {#if edit}
            Done
        {:else}
            New
        {/if}
    </Button>
</div>

<div
    id={"tooltip"}
    style={`position: absolute; left: ${tooltip.x}px; top: ${tooltip.y}px;`}
    class:hidden={!tooltip.x && !tooltip.y}
    class={[
        "flex",
        "justify-between",
        "w-fit",
        "rounded-sm",
        "bg-black dark:bg-white",
        "text-white dark:text-black",
    ]}
>
    <button
        class="font-medium text-xs hover:bg-stone-900 dark:hover:bg-stone-200 rounded-l-sm px-[10px] py-[5px]"
        onclick={handleTooltipEdit}
        >Edit</button
    >
    <button
        class="font-medium text-xs hover:bg-red-500 dark:text-stone-700 rounded-r-sm px-[10px] py-[5px]"
        onclick={handleTooltipDelete}
        >Delete</button
    >
</div>
