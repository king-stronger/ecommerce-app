<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductGrid from '#lib/components/product-grid.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.category.name} · Boutique</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
	<a href={resolve('/')} class="text-sm text-muted-foreground hover:text-foreground">Toutes les pièces</a>
	<h1 class="mt-6 text-4xl font-semibold tracking-tight">{data.category.name}</h1>
	{#if data.category.description}
		<p class="mt-3 max-w-[48ch] text-sm text-muted-foreground">{data.category.description}</p>
	{/if}

	<div class="mt-12">
		{#if data.products.length === 0}
			<p class="text-sm text-foreground/70">Rien dans cette catégorie.</p>
		{:else}
			<ProductGrid products={data.products} />
		{/if}
	</div>
</section>
