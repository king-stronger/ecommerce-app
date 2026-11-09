<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductGrid from '#lib/components/product-grid.svelte';
	import { productImage, productPrice } from '#lib/catalog';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const heroImage =
		'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80';
	const bannerImage =
		'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1600&q=80';
	const menImage =
		'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80';
	const womenImage =
		'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80';

	const editSlugs = ['column-dress', 'lunettes', 'tailored-trousers', 'cabas'];
	const edit = $derived(
		editSlugs
			.map((slug) => data.products.find((product) => product.slug === slug))
			.filter((product): product is (typeof data.products)[number] => !!product)
	);
	const bestsellers = $derived(
		data.products.filter((product) => !editSlugs.includes(product.slug)).slice(0, 8)
	);
	const newArrivals = $derived(
		[...data.products].sort((a, b) => b.name.localeCompare(a.name)).slice(0, 4)
	);

	const departmentTiles = $derived(
		[
			{ slug: 'women', label: 'Women', image: womenImage },
			{ slug: 'men', label: 'Men', image: menImage },
			{
				slug: 'bags',
				label: 'Bags',
				image: data.categories.find((c) => c.slug === 'bags')?.image ?? bannerImage
			},
			{
				slug: 'shoes',
				label: 'Shoes',
				image: data.categories.find((c) => c.slug === 'shoes')?.image ?? null
			}
		].filter((tile) => data.categories.some((c) => c.slug === tile.slug))
	);
</script>

<svelte:head>
	<title>FORMA</title>
</svelte:head>

{#if data.error}
	<p class="mx-auto max-w-6xl px-4 py-16 text-sm sm:px-6">{data.error}</p>
{:else}
	<section class="relative min-h-[70vh] overflow-hidden">
		<img src={heroImage} alt="" class="absolute inset-0 size-full object-cover" />
		<div class="absolute inset-0 bg-black/25"></div>
		<div class="relative mx-auto flex min-h-[70vh] max-w-6xl items-end px-4 py-14 sm:px-6 sm:py-20">
			<div class="max-w-xl text-white">
				<h1 class="font-serif text-4xl leading-[1.05] text-balance sm:text-6xl">
					Quiet luxury, loudly considered.
				</h1>
				<p class="mt-5 max-w-[38ch] text-sm text-white/85 sm:text-base">
					Explore clothing and statement accessories curated for every season, every style, and
					every occasion.
				</p>
				<div class="mt-8 flex flex-wrap items-center gap-4">
					<a
						href="#edit"
						class="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
					>
						Shop the edit
					</a>
					<a href="#bestsellers" class="text-sm text-white underline underline-offset-4">
						View bestsellers →
					</a>
				</div>
			</div>
		</div>
	</section>

	{#if edit.length > 0}
		<section id="edit" class="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6">
			<div class="mb-6 flex items-end justify-between gap-4">
				<div>
					<h2 class="font-serif text-3xl tracking-tight">This week's edit</h2>
					<p class="mt-2 text-sm text-muted-foreground">Four pieces to build the week around.</p>
				</div>
				<a
					href={resolve('/categories/[slug]', { slug: 'women' })}
					class="text-sm underline underline-offset-4"
				>
					View all →
				</a>
			</div>
			<div class="grid gap-4 md:grid-cols-3 md:grid-rows-2">
				{#if edit[0]}
					<a
						href={resolve('/products/[slug]', { slug: edit[0].slug })}
						class="relative overflow-hidden rounded-2xl bg-muted md:row-span-2"
					>
						{#if productImage(edit[0])}
							<img
								src={productImage(edit[0])}
								alt={edit[0].name}
								class="aspect-3/4 h-full w-full object-cover md:aspect-auto"
							/>
						{/if}
						<div
							class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-5 text-white"
						>
							<p class="font-medium">{edit[0].name}</p>
							<p class="text-sm tabular-nums">{productPrice(edit[0])}</p>
						</div>
					</a>
				{/if}
				{#if edit[1]}
					<a
						href={resolve('/products/[slug]', { slug: edit[1].slug })}
						class="relative overflow-hidden rounded-2xl bg-muted md:row-span-2"
					>
						{#if productImage(edit[1])}
							<img
								src={productImage(edit[1])}
								alt={edit[1].name}
								class="aspect-3/4 h-full w-full object-cover md:aspect-auto"
							/>
						{/if}
						<div
							class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-5 text-white"
						>
							<p class="font-medium">{edit[1].name}</p>
							<p class="text-sm tabular-nums">{productPrice(edit[1])}</p>
						</div>
					</a>
				{/if}
				{#each edit.slice(2, 4) as product (product.id)}
					<a
						href={resolve('/products/[slug]', { slug: product.slug })}
						class="relative overflow-hidden rounded-2xl bg-muted"
					>
						{#if productImage(product)}
							<img
								src={productImage(product)}
								alt={product.name}
								class="aspect-video w-full object-cover"
							/>
						{/if}
						<div
							class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-4 text-white"
						>
							<p class="text-sm font-medium">{product.name}</p>
							<p class="text-xs tabular-nums">{productPrice(product)}</p>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if departmentTiles.length > 0}
		<section class="mx-auto max-w-6xl px-4 pb-14 sm:px-6" aria-label="Shop by department">
			<div class="mb-6">
				<h2 class="font-serif text-3xl tracking-tight">Shop by department</h2>
				<p class="mt-2 text-sm text-muted-foreground">Jump straight into the aisle you need.</p>
			</div>
			<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
				{#each departmentTiles as tile (tile.slug)}
					<a
						href={resolve('/categories/[slug]', { slug: tile.slug })}
						class="group relative aspect-4/5 overflow-hidden rounded-2xl bg-muted"
					>
						{#if tile.image}
							<img
								src={tile.image}
								alt=""
								class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
							/>
						{/if}
						<div
							class="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
						></div>
						<span class="absolute inset-x-0 bottom-0 p-4 font-serif text-2xl text-white">
							{tile.label}
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="relative mx-4 overflow-hidden rounded-3xl sm:mx-6">
		<div class="mx-auto max-w-6xl">
			<div class="relative min-h-72 overflow-hidden rounded-3xl">
				<img src={bannerImage} alt="" class="absolute inset-0 size-full object-cover" />
				<div class="absolute inset-0 bg-black/35"></div>
				<div class="relative flex min-h-72 max-w-lg flex-col justify-end gap-4 p-8 text-white sm:p-12">
					<h2 class="font-serif text-3xl text-balance sm:text-4xl">
						Carry confidence with every single outfit today
					</h2>
					<a
						href={resolve('/categories/[slug]', { slug: 'bags' })}
						class="inline-flex h-10 w-fit items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
					>
						Shop the bags
					</a>
				</div>
			</div>
		</div>
	</section>

	{#if bestsellers.length > 0}
		<section id="bestsellers" class="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6">
			<div class="mb-6 flex items-end justify-between gap-4">
				<div>
					<h2 class="font-serif text-3xl tracking-tight">Best sellers</h2>
					<p class="mt-2 text-sm text-muted-foreground">What customers keep coming back for.</p>
				</div>
				<a href="#edit" class="text-sm underline underline-offset-4">Back to edit →</a>
			</div>
			<ProductGrid products={bestsellers} columns="dense" />
		</section>
	{/if}

	{#if newArrivals.length > 0}
		<section class="border-y border-border bg-secondary/40">
			<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<div class="mb-6 flex items-end justify-between gap-4">
					<div>
						<h2 class="font-serif text-3xl tracking-tight">New arrivals</h2>
						<p class="mt-2 text-sm text-muted-foreground">Fresh pieces just on the floor.</p>
					</div>
					<a
						href={resolve('/categories/[slug]', { slug: 'accessories' })}
						class="text-sm underline underline-offset-4"
					>
						Browse more →
					</a>
				</div>
				<ProductGrid products={newArrivals} columns="dense" />
			</div>
		</section>
	{/if}

	<section class="bg-foreground text-background">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6"
		>
			<div>
				<h2 class="font-serif text-3xl tracking-tight sm:text-4xl">Welcome offer</h2>
				<p class="mt-3 max-w-[40ch] text-sm text-background/70">
					Use WELCOME10 at checkout for 10% off orders from €20. Cap €15.
				</p>
			</div>
			<a
				href="#bestsellers"
				class="inline-flex h-11 items-center rounded-full bg-background px-6 text-sm font-medium text-foreground"
			>
				Browse the shop →
			</a>
		</div>
	</section>

	<footer class="border-t border-border">
		<div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.2fr_1fr_1fr] sm:px-6">
			<div>
				<p class="font-serif text-2xl tracking-[0.12em]">FORMA</p>
				<p class="mt-3 max-w-[32ch] text-sm text-muted-foreground">
					English-language quiet luxury for everyday dressing across Europe.
				</p>
			</div>
			<div>
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Shop</p>
				<ul class="mt-3 grid gap-2 text-sm">
					{#each data.categories as category (category.id)}
						<li>
							<a
								href={resolve('/categories/[slug]', { slug: category.slug })}
								class="hover:underline"
							>
								{category.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<p class="text-xs tracking-[0.14em] text-muted-foreground uppercase">Help</p>
				<ul class="mt-3 grid gap-2 text-sm">
					<li>
						<a href={resolve('/compte')} class="hover:underline">Account</a>
					</li>
					<li>
						<a href={resolve('/panier')} class="hover:underline">Bag</a>
					</li>
					<li>
						<a href="#bestsellers" class="hover:underline">Bestsellers</a>
					</li>
				</ul>
			</div>
		</div>
		<p class="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
			© {new Date().getFullYear()} FORMA. Prices in EUR.
		</p>
	</footer>
{/if}
