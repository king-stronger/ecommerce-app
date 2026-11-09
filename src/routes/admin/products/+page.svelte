<script lang="ts">
	import { resolve } from '$app/paths';
	import { deleteAdminProductsById, getAdminProducts } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import { Button } from '#lib/components/ui/button/index.js';
	import { onMount } from 'svelte';

	type Product = NonNullable<Awaited<ReturnType<typeof getAdminProducts>>['data']>[number];

	let products = $state<Product[]>([]);
	let loading = $state(true);
	let error = $state('');
	let busyId = $state<string | null>(null);

	async function load() {
		loading = true;
		error = '';
		const result = await getAdminProducts();
		loading = false;
		if (result.error || !result.data) {
			error = 'Could not load products.';
			return;
		}
		products = result.data;
	}

	onMount(load);

	function defaultPrice(product: Product) {
		const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
		return variant ? formatPrice(variant.price) : '—';
	}

	async function remove(product: Product) {
		if (!confirm(`Delete “${product.name}”?`)) return;
		busyId = product.id;
		const result = await deleteAdminProductsById({ path: { id: product.id } });
		busyId = null;
		if (result.error) {
			error = 'Delete failed.';
			return;
		}
		products = products.filter((item) => item.id !== product.id);
	}
</script>

<svelte:head>
	<title>Products · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-serif text-3xl tracking-tight">Products</h1>
			<p class="mt-2 text-sm text-muted-foreground">Create, edit, and archive catalog items.</p>
		</div>
		<a
			href={resolve('/admin/products/new')}
			class="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
		>
			New product
		</a>
	</div>

	{#if error}
		<p class="mt-6 text-sm text-destructive">{error}</p>
	{/if}

	{#if loading}
		<p class="mt-8 text-sm text-muted-foreground">Loading products…</p>
	{:else if products.length === 0}
		<p class="mt-8 text-sm text-muted-foreground">No products yet.</p>
	{:else}
		<div class="mt-8 overflow-x-auto">
			<table class="w-full min-w-[40rem] border-collapse text-left text-sm">
				<thead>
					<tr class="border-b border-border text-xs tracking-[0.12em] text-muted-foreground uppercase">
						<th class="py-3 pr-3 font-medium">Name</th>
						<th class="py-3 pr-3 font-medium">Status</th>
						<th class="py-3 pr-3 font-medium">Variants</th>
						<th class="py-3 pr-3 font-medium">Price</th>
						<th class="py-3 font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each products as product (product.id)}
						<tr class="border-b border-border/70">
							<td class="py-3 pr-3">
								<p class="font-medium">{product.name}</p>
								<p class="text-xs text-muted-foreground">{product.slug}</p>
							</td>
							<td class="py-3 pr-3 capitalize">{product.status}</td>
							<td class="py-3 pr-3 tabular-nums">{product.variants.length}</td>
							<td class="py-3 pr-3 tabular-nums">{defaultPrice(product)}</td>
							<td class="py-3">
								<div class="flex flex-wrap gap-2">
									<a
										href={resolve('/admin/products/[id]', { id: product.id })}
										class="underline underline-offset-4"
									>
										Edit
									</a>
									<Button
										variant="ghost"
										size="sm"
										class="h-auto px-0 text-destructive"
										disabled={busyId === product.id}
										onclick={() => remove(product)}
									>
										Delete
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
