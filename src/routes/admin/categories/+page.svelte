<script lang="ts">
	import {
		deleteAdminCategoriesById,
		getAdminCategories,
		patchAdminCategoriesById,
		postAdminCategories
	} from '#lib/api/client';
	import { slugify } from '#lib/admin';
	import AdminTableSkeleton from '#lib/components/admin-table-skeleton.svelte';
	import ListPagination from '#lib/components/list-pagination.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { onMount } from 'svelte';

	type Category = NonNullable<Awaited<ReturnType<typeof getAdminCategories>>['data']>[number];

	const PAGE_SIZE = 8;

	let categories = $state<Category[]>([]);
	let loading = $state(true);
	let error = $state('');
	let message = $state('');
	let busy = $state(false);
	let search = $state('');
	let draftSearch = $state('');
	let activeFilter = $state<'all' | 'active' | 'inactive'>('all');
	let offset = $state(0);

	let name = $state('');
	let slug = $state('');
	let image = $state('');
	let editingId = $state<string | null>(null);

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return categories.filter((category) => {
			if (activeFilter === 'active' && !category.isActive) return false;
			if (activeFilter === 'inactive' && category.isActive) return false;
			if (!q) return true;
			return (
				category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q)
			);
		});
	});

	const pageItems = $derived(filtered.slice(offset, offset + PAGE_SIZE));

	async function load() {
		loading = true;
		error = '';
		const result = await getAdminCategories();
		loading = false;
		if (result.error || !result.data) {
			error = 'Could not load categories.';
			return;
		}
		categories = result.data;
	}

	onMount(load);

	function applyFilters(event: SubmitEvent) {
		event.preventDefault();
		search = draftSearch;
		offset = 0;
	}

	function startEdit(category: Category) {
		editingId = category.id;
		name = category.name;
		slug = category.slug;
		image = category.image ?? '';
		message = '';
		error = '';
	}

	function resetForm() {
		editingId = null;
		name = '';
		slug = '';
		image = '';
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = '';
		message = '';
		const body = {
			name: name.trim(),
			slug: (slug.trim() || slugify(name)).trim(),
			...(image.trim() ? { image: image.trim() } : editingId ? { image: '' } : {})
		};

		const result = editingId
			? await patchAdminCategoriesById({ path: { id: editingId }, body })
			: await postAdminCategories({ body });

		busy = false;
		if (result.error) {
			error = editingId ? 'Update failed.' : 'Create failed.';
			return;
		}
		message = editingId ? 'Category updated.' : 'Category created.';
		resetForm();
		await load();
	}

	async function remove(category: Category) {
		if (!confirm(`Delete category “${category.name}”?`)) return;
		busy = true;
		const result = await deleteAdminCategoriesById({ path: { id: category.id } });
		busy = false;
		if (result.error) {
			error = 'Delete failed.';
			return;
		}
		if (editingId === category.id) resetForm();
		await load();
	}
</script>

<svelte:head>
	<title>Categories · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Categories</h1>
	<p class="mt-2 text-sm text-muted-foreground">Departments shown in the shop header.</p>

	<form class="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2" onsubmit={save}>
		<div class="grid gap-1.5 sm:col-span-2">
			<p class="text-sm font-medium">{editingId ? 'Edit category' : 'New category'}</p>
		</div>
		<div class="grid gap-1.5">
			<Label for="cat-name">Name</Label>
			<Input
				id="cat-name"
				bind:value={name}
				required
				oninput={() => {
					if (!editingId) slug = slugify(name);
				}}
			/>
		</div>
		<div class="grid gap-1.5">
			<Label for="cat-slug">Slug</Label>
			<Input id="cat-slug" bind:value={slug} required />
		</div>
		<div class="grid gap-1.5 sm:col-span-2">
			<Label for="cat-image">Image URL</Label>
			<Input id="cat-image" type="url" bind:value={image} placeholder="https://…" />
		</div>
		<div class="flex flex-wrap gap-2 sm:col-span-2">
			<Button class="rounded-full" type="submit" disabled={busy}>
				{editingId ? 'Save changes' : 'Create category'}
			</Button>
			{#if editingId}
				<Button class="rounded-full" variant="outline" type="button" onclick={resetForm}>
					Cancel
				</Button>
			{/if}
		</div>
		{#if error}
			<p class="text-sm text-destructive sm:col-span-2">{error}</p>
		{/if}
		{#if message}
			<p class="text-sm text-muted-foreground sm:col-span-2">{message}</p>
		{/if}
	</form>

	<form class="mt-8 flex flex-wrap items-end gap-3" onsubmit={applyFilters}>
		<div class="min-w-48 flex-1">
			<label class="mb-1.5 block text-xs tracking-[0.12em] text-muted-foreground uppercase" for="q">
				Search
			</label>
			<Input id="q" placeholder="Name or slug" bind:value={draftSearch} />
		</div>
		<div>
			<label
				class="mb-1.5 block text-xs tracking-[0.12em] text-muted-foreground uppercase"
				for="active"
			>
				Visibility
			</label>
			<select
				id="active"
				class="border-input bg-background h-9 rounded-md border px-3 text-sm"
				value={activeFilter}
				onchange={(event) => {
					activeFilter = (event.currentTarget as HTMLSelectElement).value as typeof activeFilter;
					offset = 0;
				}}
			>
				<option value="all">All</option>
				<option value="active">Active</option>
				<option value="inactive">Inactive</option>
			</select>
		</div>
		<Button class="rounded-full" type="submit">Filter</Button>
	</form>

	{#if loading}
		<AdminTableSkeleton rows={5} cols={3} />
	{:else if filtered.length === 0}
		<p class="mt-8 text-sm text-muted-foreground">No categories match these filters.</p>
	{:else}
		<ul class="mt-8 divide-y divide-border rounded-2xl border border-border">
			{#each pageItems as category (category.id)}
				<li class="flex flex-wrap items-center gap-4 px-4 py-3">
					{#if category.image}
						<img src={category.image} alt="" class="size-10 rounded-full object-cover" />
					{:else}
						<div class="size-10 rounded-full bg-muted"></div>
					{/if}
					<div class="min-w-0 flex-1">
						<p class="font-medium">{category.name}</p>
						<p class="text-xs text-muted-foreground">
							{category.slug}
							{#if !category.isActive}
								· inactive
							{/if}
						</p>
					</div>
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Edit ${category.name}`}
							title="Edit"
							onclick={() => startEdit(category)}
						>
							<Pencil size={16} strokeWidth={1.7} />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							class="text-destructive hover:bg-destructive/10"
							disabled={busy}
							aria-label={`Delete ${category.name}`}
							title="Delete"
							onclick={() => remove(category)}
						>
							<Trash2 size={16} strokeWidth={1.7} />
						</Button>
					</div>
				</li>
			{/each}
		</ul>
		<ListPagination
			total={filtered.length}
			limit={PAGE_SIZE}
			{offset}
			onPage={(next) => {
				offset = next;
			}}
		/>
	{/if}
</section>
