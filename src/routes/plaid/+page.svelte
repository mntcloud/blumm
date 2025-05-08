<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";

</script>
<form class="flex flex-col w-[225px]">
    <Input type="email" placeholder="your@email.com" />
    <Input type="password" minlength="8" maxlength="64" placeholder="swordfish" />
    <div class="flex">
        <Button isPrimary={true}>Login</Button>
            <a 
                class="mt-[7.5px] text-sm mt-[1px]
                 text-stone-400  dark:text-stone-700
                 transition-all 
                 decoration-white dark:decoration-black underline-offset-2
                 hover:underline hover:decoration-stone-500
                 hover:text-stone-900 dark:hover:text-stone-400" href="/signup">or sign up</a>
    </div>
</form>