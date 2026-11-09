<script lang="ts">
	import { resolve } from '$app/paths';
	import { getCart } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import { setCartCount } from '#lib/cart-count.svelte';
	import { onMount } from 'svelte';

	let cart = $state<Awaited<ReturnType<typeof getCart>>['data']>(undefined);
	let failed = $state(false);

	onMount(async () => {
		const result = await getCart();
		if (result.error || !result.data) {
			failed = true;
			return;
		}
		cart = result.data;
		setCartCount(result.data.items.reduce((sum, item) => sum + item.quantity, 0));
	});
</script>

<svelte:head>
	<title>Bag · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Bag</h1>

	{#if failed}
		<p class="mt-6 text-sm">The bag could not be loaded. Try again in a moment.</p>
	{:else if !cart}
		<p class="mt-6 text-sm text-muted-foreground">Loading your bag…</p>
	{:else if cart.items.length === 0}
		<p class="mt-6 text-sm text-muted-foreground">Your bag is empty.</p>
		<a href={resolve('/')} class="mt-4 inline-flex text-sm font-medium underline underline-offset-4">
			Continue shopping
		</a>
	{:else}
		<ul class="mt-8 divide-y divide-border">
			{#each cart.items as item (item.id)}
				<li class="flex items-baseline justify-between gap-4 py-4">
					<div>
						<a
							href={resolve('/products/[slug]', { slug: item.productSlug })}
							class="font-medium hover:underline"
						>
							{item.productName}
						</a>
						<p class="text-sm text-muted-foreground">
							{item.variantName} · {item.quantity}
						</p>
					</div>
					<p class="tabular-nums">{formatPrice(item.lineTotal)}</p>
				</li>
			{/each}
		</ul>
		<p class="mt-6 flex justify-between text-sm font-medium">
			<span>Subtotal</span>
			<span class="tabular-nums">{formatPrice(cart.subtotal)}</span>
		</p>
		<p class="mt-3 text-sm text-muted-foreground">
			Shipping and WELCOME10 are chosen at checkout.
		</p>
	{/if}
</section>
