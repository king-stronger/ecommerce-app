<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		centsToEurosInput,
		eurosToCents,
		parseImages,
		slugify
	} from '#lib/admin';
	import {
		deleteAdminVariantsById,
		getAdminCategories,
		getAdminProductsById,
		patchAdminProductsById,
		patchAdminVariantsById,
		postAdminProductsByIdVariants
	} from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	type Product = NonNullable<Awaited<ReturnType<typeof getAdminProductsById>>['data']>;
	type Category = NonNullable<Awaited<ReturnType<typeof getAdminCategories>>['data']>[number];
	type Variant = Product['variants'][number];

	const productId = $derived(page.params.id ?? '');

	let product = $state<Product | null>(null);
	let categories = $state<Category[]>([]);
	let loading = $state(true);
	let error = $state('');
	let message = $state('');
	let busy = $state(false);

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

	async function load() {
		loading = true;
		error = '';
		const [productResult, categoryResult] = await Promise.all([
			getAdminProductsById({ path: { id: productId } }),
			getAdminCategories()
		]);
		loading = false;

		if (categoryResult.data) categories = categoryResult.data;
		if (productResult.error || !productResult.data) {
			error = 'Product not found.';
			product = null;
			return;
		}

		product = productResult.data;
		name = product.name;
		slug = product.slug;
		shortDescription = product.shortDescription ?? '';
		description = product.description ?? '';
		status = product.status;
		imageUrl = parseImages(product.images)[0]?.url ?? '';
		categoryIds =
			'categoryIds' in product && Array.isArray(product.categoryIds)
				? product.categoryIds.filter((id): id is string => typeof id === 'string')
				: [];
	}

	onMount(load);

	function toggleCategory(id: string) {
		categoryIds = categoryIds.includes(id)
			? categoryIds.filter((item) => item !== id)
			: [...categoryIds, id];
	}

	async function saveProduct(event: SubmitEvent) {
		event.preventDefault();
		if (!product) return;
		busy = true;
		error = '';
		message = '';

		const result = await patchAdminProductsById({
			path: { id: product.id },
			body: {
				name: name.trim(),
				slug: (slug.trim() || slugify(name)).trim(),
				shortDescription: shortDescription.trim() || undefined,
				description: description.trim() || undefined,
				status,
				images: imageUrl.trim()
					? [{ url: imageUrl.trim(), alt: name.trim(), sort: 0 }]
					: [],
				categoryIds
			}
		});

		busy = false;
		if (result.error || !result.data) {
			error = 'Could not save product.';
			return;
		}
		product = result.data;
		message = 'Product saved.';
	}

	async function addVariant(event: SubmitEvent) {
		event.preventDefault();
		if (!product) return;
		busy = true;
		error = '';
		message = '';

		const result = await postAdminProductsByIdVariants({
			path: { id: product.id },
			body: {
				name: variantName.trim() || 'Default',
				price: eurosToCents(priceEuros),
				stockQuantity: Number.parseInt(stockQuantity, 10) || 0,
				trackInventory: true,
				isDefault: product.variants.length === 0,
				isActive: true
			}
		});

		busy = false;
		if (result.error) {
			error = 'Could not add variant.';
			return;
		}
		variantName = 'Default';
		priceEuros = '49.00';
		stockQuantity = '10';
		message = 'Variant added.';
		await load();
	}

	async function saveVariant(variant: Variant, form: HTMLFormElement) {
		const data = new FormData(form);
		busy = true;
		error = '';
		message = '';
		const result = await patchAdminVariantsById({
			path: { id: variant.id },
			body: {
				name: String(data.get('name') ?? variant.name),
				price: eurosToCents(String(data.get('price') ?? '0')),
				stockQuantity: Number.parseInt(String(data.get('stock') ?? '0'), 10) || 0,
				isActive: data.get('active') === 'on',
				isDefault: data.get('default') === 'on'
			}
		});
		busy = false;
		if (result.error) {
			error = 'Could not update variant.';
			return;
		}
		message = 'Variant updated.';
		await load();
	}

	async function removeVariant(variant: Variant) {
		if (!confirm(`Delete variant “${variant.name}”?`)) return;
		busy = true;
		const result = await deleteAdminVariantsById({ path: { id: variant.id } });
		busy = false;
		if (result.error) {
			error = 'Could not delete variant.';
			return;
		}
		message = 'Variant deleted.';
		await load();
	}
</script>

<svelte:head>
	<title>{product?.name ?? 'Product'} · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<a href={resolve('/admin/products')} class="text-sm underline underline-offset-4">← Products</a>

	{#if loading}
		<p class="mt-8 text-sm text-muted-foreground">Loading product…</p>
	{:else if !product}
		<p class="mt-8 text-sm text-destructive">{error || 'Product not found.'}</p>
	{:else}
		<h1 class="mt-4 font-serif text-3xl tracking-tight">{product.name}</h1>

		<form class="mt-8 grid gap-5" onsubmit={saveProduct}>
			<div class="grid gap-1.5">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} required />
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
				<Input id="image" type="url" bind:value={imageUrl} />
				{#if imageUrl}
					<img src={imageUrl} alt="" class="mt-2 aspect-square max-w-40 rounded-xl object-cover" />
				{/if}
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

			<Button class="w-fit rounded-full" type="submit" disabled={busy}>Save product</Button>
		</form>

		<section class="mt-12">
			<h2 class="font-serif text-2xl tracking-tight">Variants</h2>
			<ul class="mt-4 grid gap-4">
				{#each product.variants as variant (variant.id)}
					<li class="rounded-2xl border border-border p-4">
						<form
							class="grid gap-3 sm:grid-cols-2"
							onsubmit={(event) => {
								event.preventDefault();
								saveVariant(variant, event.currentTarget);
							}}
						>
							<div class="grid gap-1.5">
								<Label for={`v-name-${variant.id}`}>Name</Label>
								<Input id={`v-name-${variant.id}`} name="name" value={variant.name} required />
							</div>
							<div class="grid gap-1.5">
								<Label for={`v-price-${variant.id}`}>Price (€)</Label>
								<Input
									id={`v-price-${variant.id}`}
									name="price"
									value={centsToEurosInput(variant.price)}
									required
								/>
							</div>
							<div class="grid gap-1.5">
								<Label for={`v-stock-${variant.id}`}>Stock</Label>
								<Input
									id={`v-stock-${variant.id}`}
									name="stock"
									type="number"
									min="0"
									value={variant.stockQuantity}
								/>
							</div>
							<div class="flex flex-wrap items-end gap-4 text-sm">
								<label class="flex items-center gap-2">
									<input type="checkbox" name="active" checked={variant.isActive} />
									Active
								</label>
								<label class="flex items-center gap-2">
									<input type="checkbox" name="default" checked={variant.isDefault} />
									Default
								</label>
							</div>
							<div class="flex flex-wrap gap-2 sm:col-span-2">
								<Button class="rounded-full" size="sm" type="submit" disabled={busy}>
									Save variant
								</Button>
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive"
									type="button"
									disabled={busy}
									onclick={() => removeVariant(variant)}
								>
									Delete
								</Button>
								<span class="self-center text-xs text-muted-foreground">
									Current {formatPrice(variant.price)}
								</span>
							</div>
						</form>
					</li>
				{/each}
			</ul>

			<form class="mt-6 grid gap-4 rounded-2xl border border-dashed border-border p-4" onsubmit={addVariant}>
				<p class="text-sm font-medium">Add variant</p>
				<div class="grid gap-4 sm:grid-cols-3">
					<div class="grid gap-1.5">
						<Label for="new-variant-name">Name</Label>
						<Input id="new-variant-name" bind:value={variantName} required />
					</div>
					<div class="grid gap-1.5">
						<Label for="new-price">Price (€)</Label>
						<Input id="new-price" bind:value={priceEuros} required />
					</div>
					<div class="grid gap-1.5">
						<Label for="new-stock">Stock</Label>
						<Input id="new-stock" type="number" min="0" bind:value={stockQuantity} />
					</div>
				</div>
				<Button class="w-fit rounded-full" type="submit" disabled={busy}>Add variant</Button>
			</form>
		</section>

		{#if error}
			<p class="mt-6 text-sm text-destructive">{error}</p>
		{/if}
		{#if message}
			<p class="mt-6 text-sm text-muted-foreground">{message}</p>
		{/if}
	{/if}
</section>
