<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductGrid from '#lib/components/product-grid.svelte';
	import { productImage, productPrice } from '#lib/catalog';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const washes = [
		'bg-[oklch(0.9_0.06_155)]',
		'bg-[oklch(0.91_0.07_75)]',
		'bg-[oklch(0.9_0.06_40)]',
		'bg-[oklch(0.9_0.05_230)]',
		'bg-[oklch(0.91_0.06_20)]'
	];

	const lead = $derived(data.shelves.flatMap((shelf) => shelf.products)[0]);
	const leadImage = $derived(lead ? productImage(lead) : null);
	const stocked = $derived(data.shelves.filter((shelf) => shelf.products.length > 0));

	function shelfImage(shelf: (typeof data.shelves)[number]) {
		if (shelf.category.image) return shelf.category.image;
		const first = shelf.products[0];
		return first ? productImage(first) : null;
	}
</script>

<svelte:head>
	<title>Boutique</title>
</svelte:head>

{#if data.error}
	<p class="mx-auto max-w-6xl px-4 py-16 text-sm sm:px-6">{data.error}</p>
{:else}
	{#if lead}
		<section class="px-4 pt-6 sm:px-6">
			<div
				class="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-accent text-accent-foreground md:min-h-[28rem] md:grid-cols-2"
			>
				{#if leadImage}
					<div class="relative min-h-72 md:order-2 md:min-h-full">
						<img
							src={leadImage}
							alt={lead.name}
							class="absolute inset-0 size-full object-cover"
						/>
					</div>
				{/if}
				<div class="grid content-center gap-5 p-6 sm:p-10 md:order-1">
					<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{lead.name}</h1>
					<p class="text-2xl font-semibold tabular-nums">{productPrice(lead)}</p>
					{#if lead.shortDescription}
						<p class="max-w-[36ch] text-accent-foreground/85">{lead.shortDescription}</p>
					{/if}
					<a
						href={resolve('/products/[slug]', { slug: lead.slug })}
						class="inline-flex h-11 w-fit items-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
					>
						Voir la pièce
					</a>
				</div>
			</div>
		</section>
	{/if}

	{#if data.shelves.length > 0}
		<section class="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-label="Rayons">
			<h2 class="mb-5 text-2xl font-semibold tracking-tight">Les rayons</h2>
			<ul class="grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each data.shelves as shelf, index (shelf.category.id)}
					<li>
						<a
							href={resolve('/categories/[slug]', { slug: shelf.category.slug })}
							class="grid gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
						>
							<div class="overflow-hidden rounded-3xl {washes[index % washes.length]}">
								{#if shelfImage(shelf)}
									<img
										src={shelfImage(shelf)}
										alt=""
										class="aspect-square w-full object-cover"
									/>
								{:else}
									<div class="aspect-square w-full"></div>
								{/if}
							</div>
							<span class="px-1 font-medium tracking-tight">{shelf.category.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#each stocked as shelf (shelf.category.id)}
		<section class="mx-auto max-w-6xl scroll-mt-32 px-4 pb-12 sm:px-6">
			<div class="mb-5 flex items-baseline justify-between gap-4">
				<h2 class="text-2xl font-semibold tracking-tight">{shelf.category.name}</h2>
				<a
					href={resolve('/categories/[slug]', { slug: shelf.category.slug })}
					class="text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4"
				>
					Tout voir
				</a>
			</div>
			<ProductGrid products={shelf.products} />
		</section>
	{/each}

	{#if !lead}
		<p class="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground sm:px-6">
			Rien en rayon pour le moment.
		</p>
	{/if}

	<section class="px-4 pb-10 sm:px-6">
		<div
			class="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl bg-secondary px-6 py-8 text-secondary-foreground sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="max-w-[46ch] text-sm">
				Standard 4,99 €, Express 9,99 €. Le choix se fait au moment de commander.
			</p>
			<p class="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
				WELCOME10 retire 10 % dès 20 €.
			</p>
		</div>
	</section>
{/if}
