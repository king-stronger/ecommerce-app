<script lang="ts">
	import { resolve } from '$app/paths';
	import { productImage, productPrice, type CatalogProduct } from '#lib/catalog';

	let {
		products,
		columns = 'normal'
	}: {
		products: CatalogProduct[];
		columns?: 'normal' | 'dense';
	} = $props();
</script>

<ul
	class="grid gap-x-5 gap-y-8 {columns === 'dense'
		? 'grid-cols-2 lg:grid-cols-4'
		: 'grid-cols-2 lg:grid-cols-3'}"
>
	{#each products as product (product.id)}
		<li>
			<a
				href={resolve('/products/[slug]', { slug: product.slug })}
				class="grid gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
			>
				<div class="overflow-hidden rounded-2xl bg-muted">
					{#if productImage(product)}
						<img src={productImage(product)} alt="" class="aspect-3/4 w-full object-cover" />
					{:else}
						<div class="aspect-3/4 w-full"></div>
					{/if}
				</div>
				<div class="grid gap-1 px-0.5">
					<span class="text-sm font-medium tracking-tight">{product.name}</span>
					{#if product.shortDescription}
						<span class="text-xs text-muted-foreground">{product.shortDescription}</span>
					{/if}
					<span class="text-sm font-semibold tabular-nums">{productPrice(product)}</span>
				</div>
			</a>
		</li>
	{/each}
</ul>
