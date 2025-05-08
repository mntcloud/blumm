<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Moodboard from "$lib/components/Moodboard.svelte";
</script>

<main class="flex flex-col items-center">
    <section class="flex items-center h-screen mb-[5px]">
        <Moodboard 
            modifier={["absolute top-0 left-0 h-screen w-screen z-[-1] blur-[1.75px] opacity-35"]} 
            items={[
                {
                    type: "img",
                    src: "/avatar.jpg",
                    width: 150,
                    height: 150,
                    positionX: 20,
                    positionY: 20,
                },
                {
                    type: "img",
                    src: "/apples.jpg",
                    width: 183,
                    height: 326,
                    positionX: 550,
                    positionY: 500,
                },
                {
                    type: "img",
                    src: "/donsimon.jpg",
                    width: 240,
                    height: 224,
                    positionX: 50,
                    positionY: 600,
                }
            ]}
            />
        <div class="flex flex-col items-center mr-[30px]">
            <div class="
                select-none
                bg-white dark:bg-black
                placeholder:dark:text-neutral-700
                font-writing text-sm leading-[21px]
                px-[20px] py-[15px]
                w-[500px] h-[300px] text-justify align-middle
                border-1 border-gray-300 dark:border-stone-950
                rounded-md">
                Hi, that app helps to work with your thoughts in a way, 
                that a little different than notetaking, 
                reminding of <img class="inline-block" src="/twitter.png" width="18" height="18" alt="Twitter" title="Twitter"> 
                thread, but only for you to see, all drafts are staying in your browser. 
                <br><br> 
                And also it helps to publish drafts in 
                <img class="inline-block" src="/threads.svg" width="18" height="18" alt="Threads" title="Threads">, 
                <img class="inline-block" src="/telegram.svg" width="18" height="18" alt="Telegram" title="Telegram"> and 
                <img class="inline-block" src="/bluesky.svg" width="18" height="18" alt="Bluesky" title="Bluesky"> 
                at once in case, if you want to see reaction.
                <br><br>
                Click on + under this message to start writing right away without any sign ups
            </div>
            <Button>+</Button>
        </div>
        <div class="flex flex-col justify-start">
            <Button isPrimary={true}>Sign in</Button>
            <a 
                class="ms-[7.5px] text-sm mt-[1px]
                 text-stone-400  dark:text-stone-700
                 transition-all 
                 decoration-white dark:decoration-black underline-offset-2
                 hover:underline hover:decoration-stone-500
                 hover:text-stone-900 dark:hover:text-stone-400" href="/signup">or sign up</a>
        </div>
    </section>
</main>
