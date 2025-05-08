<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { FormEventHandler, MouseEventHandler } from "svelte/elements";

    let comp: HTMLTextAreaElement
    let {
        id,
        value = $bindable(""),
        isDisabled,
        onclick,
    }: { 
        id: string;
        value: string; 
        isDisabled: boolean;
        onclick: MouseEventHandler<HTMLTextAreaElement>
    } = $props();

    const expandMore = () => {
        if (comp.scrollHeight > window.innerHeight * 0.85) {
            comp.style.height = `${window.innerHeight * 0.85}px`
        } else {
            comp.style.height = "auto";
            comp.style.height = `${comp.scrollHeight}px`
        } 
    }

    onMount(() => {
        expandMore()

        window.addEventListener("resize", expandMore)
    })

    onDestroy(() => {
        window.removeEventListener("resize", expandMore)
    })

    const oninput: FormEventHandler<HTMLTextAreaElement> = (ev) => {
        expandMore()
    };
</script>

<textarea
    onkeydown={(ev) => {
        if (ev.key != "Tab") return;

        ev.preventDefault()

        if (ev.currentTarget.selectionStart == ev.currentTarget.selectionEnd) {
            console.log("tab here!")
            const fieldText = ev.currentTarget.value
            
            const selection = ev.currentTarget.selectionStart
            const leftSide = fieldText.slice(0, selection) + " ".repeat(4)
            const rightSide = fieldText.slice(selection, fieldText.length)

            ev.currentTarget.value = leftSide + rightSide
            ev.currentTarget.selectionStart = selection + 4
            ev.currentTarget.selectionEnd = selection + 4
        }
    }}
    {oninput}
    {onclick}
    onscroll={(ev) => {
        console.log("deeeedd", ev.currentTarget.scrollTop, )

        // Padding Top 15px + 1px border
        if (ev.currentTarget.scrollTop == 16) {
            ev.currentTarget.scrollTo(0, 0)
        }

        if (ev.currentTarget.scrollTop + Math.floor(window.innerHeight * 0.85) + 15 == ev.currentTarget.scrollHeight) {
            ev.currentTarget.scrollTo(0, ev.currentTarget.scrollHeight)
        }
    }}
    bind:this={comp}
    bind:value
    id={id}
    disabled={isDisabled}
    draggable="true"
    autocomplete="off"
    spellcheck="false"
    placeholder="click here to start writing!"
    class="
        box-border
        bg-white dark:bg-stone-950
        placeholder:dark:text-neutral-700
        font-writing text-sm leading-[21px]
        overflow-y-hidden
        px-[20px] py-[15px]
        w-[500px] resize-none
        border-1 border-stone-100 dark:border-stone-900 rounded-md
        transition outline-transparent

        focus-visible:outline-[1.5px]
        focus-visible:outline-stone-200
        focus-visible:outline-solid
        focus-visible:dark:outline-stone-800"
>
</textarea>
