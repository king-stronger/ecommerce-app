<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAdminCategories, getAdminOrders, getAdminProducts } from '#lib/api/client';
	import { onMount } from 'svelte';

	let productCount = $state<number | null>(null);
	let categoryCount = $state<number | null>(null);
	let orderCount = $state<number | null>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		loading = true;
		const [products, categories, orders] = await Promise.all([
			getAdminProducts({ query: { limit: 1, offset: 0 } }),
			getAdminCategories(),
			getAdminOrders({ query: { limit: 1, offset: 0 } })
		]);
		loading = false;
		if (products.error || categories.error || orders.error) {
			error = 'Could not load admin totals.';
			return;
		}
		productCount = products.data?.total ?? 0;
		categoryCount = categories.data?.length ?? 0;
		orderCount = orders.data?.total ?? 0;
	});
</script>

<svelte:head>
	<title>Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Dashboard</h1>
	<p class="mt-2 text-sm text-muted-foreground">Manage catalog and orders.</p>

	{#if error}
		<p class="mt-6 text-sm text-destructive">{error}</p>
	{:else if loading}
		<ul class="mt-8 grid gap-4 sm:grid-cols-3" aria-hidden="true">
			{#each [1, 2, 3] as item (item)}
				<li class="rounded-2xl border border-border bg-card p-5">
					<div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
					<div class="mt-4 h-9 w-16 animate-pulse rounded bg-muted"></div>
					<div class="mt-5 h-3 w-24 animate-pulse rounded bg-muted"></div>
				</li>
			{/each}
		</ul>
	{:else}
		<ul class="mt-8 grid gap-4 sm:grid-cols-3">
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Products</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{productCount ?? '—'}</p>
				<a
					href={resolve('/admin/products')}
					class="mt-4 inline-flex text-sm font-medium text-foreground/80 hover:text-foreground"
				>
					Manage →
				</a>
			</li>
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Categories</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{categoryCount ?? '—'}</p>
				<a
					href={resolve('/admin/categories')}
					class="mt-4 inline-flex text-sm font-medium text-foreground/80 hover:text-foreground"
				>
					Manage →
				</a>
			</li>
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Orders</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{orderCount ?? '—'}</p>
				<a
					href={resolve('/admin/orders')}
					class="mt-4 inline-flex text-sm font-medium text-foreground/80 hover:text-foreground"
				>
					View →
				</a>
			</li>
		</ul>
	{/if}
</section>
