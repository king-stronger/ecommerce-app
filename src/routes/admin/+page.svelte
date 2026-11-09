<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAdminCategories, getAdminOrders, getAdminProducts } from '#lib/api/client';
	import { onMount } from 'svelte';

	let productCount = $state<number | null>(null);
	let categoryCount = $state<number | null>(null);
	let orderCount = $state<number | null>(null);
	let error = $state('');

	onMount(async () => {
		const [products, categories, orders] = await Promise.all([
			getAdminProducts(),
			getAdminCategories(),
			getAdminOrders()
		]);
		if (products.error || categories.error || orders.error) {
			error = 'Could not load admin totals.';
			return;
		}
		productCount = products.data?.length ?? 0;
		categoryCount = categories.data?.length ?? 0;
		orderCount = orders.data?.length ?? 0;
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
	{:else}
		<ul class="mt-8 grid gap-4 sm:grid-cols-3">
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Products</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{productCount ?? '—'}</p>
				<a href={resolve('/admin/products')} class="mt-4 inline-flex text-sm underline underline-offset-4">
					Manage →
				</a>
			</li>
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Categories</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{categoryCount ?? '—'}</p>
				<a
					href={resolve('/admin/categories')}
					class="mt-4 inline-flex text-sm underline underline-offset-4"
				>
					Manage →
				</a>
			</li>
			<li class="rounded-2xl border border-border bg-card p-5">
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Orders</p>
				<p class="mt-3 font-serif text-3xl tabular-nums">{orderCount ?? '—'}</p>
				<a href={resolve('/admin/orders')} class="mt-4 inline-flex text-sm underline underline-offset-4">
					View →
				</a>
			</li>
		</ul>
	{/if}
</section>
