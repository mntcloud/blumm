<script lang="ts">
    const { isPrimary = false, click = undefined, modifier = [] } = $props()
</script>

<button class={[
    isPrimary ? 
        'font-semibold text-xs' :
        'font-medium text-xs',
    isPrimary ?
        'text-white' :
        'text-zinc-700 dark:text-white',
    'h-[20px] min-w-[30px] max-w-fit',
    'px-[10px] py-[10px]',
    isPrimary ? 
        'bg-blue-500 dark:bg-blue-600' : 
        'bg-white dark:bg-neutral-950', 
    'border-1 rounded-sm',
    isPrimary ?
        'border-blue-600 dark:border-blue-400' :
        'border-gray-300 dark:border-stone-800', 
    'outline-1',
        isPrimary ?
        'outline-blue-200 dark:outline-blue-900' :
        'outline-stone-100 dark:outline-stone-950',
    'mx-[7.5px]',
    'leading-0 text-center',
    ...modifier]}
    onclick={click}>
    <span>
        <slot></slot>
    </span>
</button>