<script lang="ts">
    let {
        modifier = [],
        value = $bindable(undefined),
        ...props
    }: { modifier?: string[] } & Record<string, any> = $props();
</script>

<input
    class={[
        "font-sans text-sm",
        "rounded-sm",
        "dark:bg-neutral-950",
        /* "my-[5px] mx-[7.5px] */ "px-[4px]",
        "border-1 border-stone-200 dark:border-stone-900",
        "placeholder:dark:text-stone-700",
        "outline-1 outline-stone-50 dark:outline-stone-800",
        ...modifier,
    ]}
    bind:value={value}
    {...props}
/>
