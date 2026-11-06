<script lang="ts">
	import { resolve } from '$app/paths';
	import { productImage, productPrice, type CatalogProduct } from '#lib/catalog';

	let { products }: { products: CatalogProduct[] } = $props();
</script>

<ul class="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
	{#each products as product (product.id)}
		<li>
			<a
				href={resolve('/products/[slug]', { slug: product.slug })}
				class="grid gap-3 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
			>
				<div
					class="overflow-hidden rounded-3xl bg-secondary shadow-[0_14px_28px_-18px_var(--foreground)]"
				>
					{#if productImage(product)}
						<img src={productImage(product)} alt="" class="aspect-square w-full object-cover" />
					{/if}
				</div>
				<div class="grid gap-0.5 px-1">
					<span class="font-medium tracking-tight">{product.name}</span>
					<span class="text-sm font-semibold text-primary tabular-nums">{productPrice(product)}</span>
				</div>
			</a>
		</li>
	{/each}
</ul>
