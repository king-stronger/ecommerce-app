<script lang="ts">
	import { resolve } from '$app/paths';
	import { productImage, productPrice } from '#lib/catalog';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const image = $derived(productImage(data.product));
</script>

<svelte:head>
	<title>{data.product.name} · Boutique</title>
</svelte:head>

<article class="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-start">
	<div class="overflow-hidden rounded-3xl bg-secondary">
		{#if image}
			<img src={image} alt={data.product.name} class="aspect-square w-full object-cover" />
		{/if}
	</div>
	<div class="grid content-start gap-4 lg:pt-6">
		<a href={resolve('/')} class="text-sm text-muted-foreground hover:text-foreground">Retour aux pièces</a>
		<h1 class="text-4xl font-semibold tracking-tight">{data.product.name}</h1>
		<p class="text-2xl font-semibold text-primary tabular-nums">{productPrice(data.product)}</p>
		{#if data.product.shortDescription}
			<p class="max-w-[42ch] text-sm text-muted-foreground">{data.product.shortDescription}</p>
		{/if}
	</div>
</article>
