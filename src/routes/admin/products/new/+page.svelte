<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { eurosToCents, slugify, type AdminProductImage } from '#lib/admin';
	import {
		getAdminCategories,
		postAdminProducts,
		postAdminProductsByIdVariants
	} from '#lib/api/client';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { onMount } from 'svelte';

	type Category = NonNullable<Awaited<ReturnType<typeof getAdminCategories>>['data']>[number];

	let categories = $state<Category[]>([]);
	let name = $state('');
	let slug = $state('');
	let shortDescription = $state('');
	let description = $state('');
	let status = $state<'draft' | 'active' | 'archived'>('active');
	let imageUrl = $state('');
	let categoryIds = $state<string[]>([]);
	let variantName = $state('Default');
	let priceEuros = $state('49.00');
	let stockQuantity = $state('10');
	let error = $state('');
	let busy = $state(false);

	onMount(async () => {
		const result = await getAdminCategories();
		if (result.data) categories = result.data;
	});

	function toggleCategory(id: string) {
		categoryIds = categoryIds.includes(id)
			? categoryIds.filter((item) => item !== id)
			: [...categoryIds, id];
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = '';

		const images: AdminProductImage[] = imageUrl.trim()
			? [{ url: imageUrl.trim(), alt: name.trim(), sort: 0 }]
			: [];

		const created = await postAdminProducts({
			body: {
				name: name.trim(),
				slug: (slug.trim() || slugify(name)).trim(),
				shortDescription: shortDescription.trim() || undefined,
				description: description.trim() || undefined,
				status,
				images,
				categoryIds
			}
		});

		if (created.error || !created.data) {
			busy = false;
			error = 'Could not create product.';
			return;
		}

		const variant = await postAdminProductsByIdVariants({
			path: { id: created.data.id },
			body: {
				name: variantName.trim() || 'Default',
				price: eurosToCents(priceEuros),
				stockQuantity: Number.parseInt(stockQuantity, 10) || 0,
				trackInventory: true,
				isDefault: true,
				isActive: true
			}
		});

		busy = false;
		if (variant.error) {
			error = 'Product created, but the first variant failed.';
			await goto(resolve('/admin/products/[id]', { id: created.data.id }));
			return;
		}

		await goto(resolve('/admin/products/[id]', { id: created.data.id }));
	}
</script>

<svelte:head>
	<title>New product · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<a href={resolve('/admin/products')} class="text-sm underline underline-offset-4">← Products</a>
	<h1 class="mt-4 font-serif text-3xl tracking-tight">New product</h1>

	<form class="mt-8 grid gap-5" onsubmit={save}>
		<div class="grid gap-1.5">
			<Label for="name">Name</Label>
			<Input
				id="name"
				bind:value={name}
				required
				oninput={() => {
					slug = slugify(name);
				}}
			/>
		</div>
		<div class="grid gap-1.5">
			<Label for="slug">Slug</Label>
			<Input id="slug" bind:value={slug} required />
		</div>
		<div class="grid gap-1.5">
			<Label for="short">Short description</Label>
			<Input id="short" bind:value={shortDescription} />
		</div>
		<div class="grid gap-1.5">
			<Label for="description">Description</Label>
			<textarea
				id="description"
				class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				bind:value={description}
			></textarea>
		</div>
		<div class="grid gap-1.5">
			<Label for="status">Status</Label>
			<select
				id="status"
				class="border-input bg-background h-9 rounded-md border px-3 text-sm"
				bind:value={status}
			>
				<option value="active">Active</option>
				<option value="draft">Draft</option>
				<option value="archived">Archived</option>
			</select>
		</div>
		<div class="grid gap-1.5">
			<Label for="image">Image URL</Label>
			<Input id="image" type="url" bind:value={imageUrl} placeholder="https://…" />
		</div>

		<fieldset class="grid gap-2">
			<legend class="text-sm font-medium">Categories</legend>
			{#each categories as category (category.id)}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={categoryIds.includes(category.id)}
						onchange={() => toggleCategory(category.id)}
					/>
					{category.name}
				</label>
			{/each}
		</fieldset>

		<div class="rounded-2xl border border-border p-4">
			<p class="text-sm font-medium">First variant</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-3">
				<div class="grid gap-1.5">
					<Label for="variant-name">Name</Label>
					<Input id="variant-name" bind:value={variantName} required />
				</div>
				<div class="grid gap-1.5">
					<Label for="price">Price (€)</Label>
					<Input id="price" inputmode="decimal" bind:value={priceEuros} required />
				</div>
				<div class="grid gap-1.5">
					<Label for="stock">Stock</Label>
					<Input id="stock" type="number" min="0" bind:value={stockQuantity} />
				</div>
			</div>
		</div>

		{#if error}
			<p class="text-sm text-destructive">{error}</p>
		{/if}

		<div class="flex gap-3">
			<Button class="rounded-full" type="submit" disabled={busy}>Create product</Button>
			<a
				href={resolve('/admin/products')}
				class="inline-flex h-9 items-center text-sm underline underline-offset-4"
			>
				Cancel
			</a>
		</div>
	</form>
</section>
