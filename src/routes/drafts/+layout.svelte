<script lang="ts">
	import HeaderBar from "$lib/components/HeaderBar.svelte";
	import type { LayoutProps } from "./$types";
	import Button from "$lib/components/Button.svelte";
	import { goto } from "$app/navigation";
	import type { Draft } from "$lib/client/db";

	let { data, children }: LayoutProps = $props();

	let drafts = $state<Draft[]>([]);

	let isEdited = $derived(data.params == "new");
	let isNoDraftFound = $derived(!drafts.length || isEdited);

	const handleClick = async (id: number) => {
		await goto(`/drafts/${id}`);
		// if (draft.name && draft.emoji) {
		// 	const id = await data.db.add("drafts", {
		// 		name: draft.name,
		// 		emoji: draft.emoji,
		// 	})
		// 	await goto(`/drafts/${id}`);
		// }
	};

	$effect(() => {
		console.log(data);
		if (data.params && data.params != "new") {
			data.db.getAll("drafts").then((it) => {
				drafts = it;
			});
		}

		if (data.params == "new" && !drafts.find((val) => val.id == 0)) {
			drafts.push({
				id: 0,
				emoji: "",
				name: "",
			});
		}
	});
</script>

<HeaderBar
	edit={isEdited}
	{drafts}
	handleDelete={async (id) => {
		await data.db.delete("drafts", id)

		const tx = data.db.transaction("draftUnits", "readwrite")

		for await (const cur of tx.store.index("by-parent").iterate(id)) {
			cur.delete()
		}

		await tx.done

		await goto(`/drafts/1`)
	}}
	selected={data.params != "new" ? Number.parseInt(data.params!) : 0}
	{handleClick}
	handleNew={() => {	
		goto(`/drafts/new`);
	}}
	handleEsc={async () => {
		if (data.params == "new") {
			await goto(`/drafts/1`)
		}
	}}
	handleDoneOnEdit={async (name, emoji) => {
		const draft = { emoji, name }
		let id: number = 0
		
		if (data.params != "new") {
			await data.db.put("drafts", {
				id: Number.parseInt(data.params!),
				...draft
			})
		} else {
			id = await data.db.add("drafts", {...draft})

            await data.db.add("draftUnits", {
                date: Date.now(),
                text: "",
                parent: id,
                positionY: 0,
                positionX: 0,
            });
		}

		drafts = await data.db.getAll("drafts")

		if (data.params == "new") {
			await goto(`/drafts/${id}`);
		}
	}}
/>

<main class={["max-h-screen", isEdited || isNoDraftFound ? "mt-[10px]" : ""]}>
	{#if !isNoDraftFound && !isEdited}
		{@render children()}
	{:else if isEdited}
		<div class={["flex", "flex-col", "items-center"]}>
			<h1>draft is edited</h1>
		</div>
	{:else}
		<div class={["flex", "flex-col", "items-center"]}>
			<p>no draft was found</p>
			<Button
				click={() => {
					goto("/drafts/new");
				}}>create a new one</Button
			>
		</div>
	{/if}
</main>
