<script lang="ts">
	import { resolve } from '$app/paths';
	import { getCart } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
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
	});
</script>

<svelte:head>
	<title>Panier · Boutique</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
	<h1 class="text-3xl font-semibold tracking-tight">Panier</h1>

	{#if failed}
		<p class="mt-6 text-sm">Le panier n’a pas pu être lu. Réessaie dans un instant.</p>
	{:else if !cart}
		<p class="mt-6 text-sm text-foreground/70">Chargement du panier.</p>
	{:else if cart.items.length === 0}
		<p class="mt-6 text-sm text-foreground/70">Le panier est vide.</p>
		<a href={resolve('/')} class="mt-4 inline-flex text-sm font-medium underline underline-offset-4">
			Voir les pièces
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
						<p class="text-sm text-foreground/70">
							{item.variantName} · {item.quantity}
						</p>
					</div>
					<p class="tabular-nums">{formatPrice(item.lineTotal)}</p>
				</li>
			{/each}
		</ul>
		<p class="mt-6 flex justify-between text-sm font-medium">
			<span>Sous-total</span>
			<span class="tabular-nums">{formatPrice(cart.subtotal)}</span>
		</p>
	{/if}
</section>
