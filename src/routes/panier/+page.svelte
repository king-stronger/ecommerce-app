<script lang="ts">
	import { resolve } from '$app/paths';
	import { getCart } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import { setCartCount } from '#lib/cart-count.svelte';
	import PageSkeleton from '#lib/components/page-skeleton.svelte';
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
		<div class="mt-2">
			<PageSkeleton variant="bag" />
		</div>
	{:else if cart.items.length === 0}
		<div class="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
			<p class="text-sm text-muted-foreground">Your bag is empty.</p>
			<a
				href={resolve('/')}
				class="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
			>
				Continue shopping
			</a>
		</div>
	{:else}
		<ul class="mt-8 grid gap-4">
			{#each cart.items as item (item.id)}
				<li class="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-[0_12px_30px_-24px_var(--foreground)] sm:p-4">
					<a
						href={resolve('/products/[slug]', { slug: item.productSlug })}
						class="size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"
					>
						{#if item.productImage}
							<img
								src={item.productImage}
								alt=""
								class="size-full object-cover"
							/>
						{/if}
					</a>
					<div class="grid min-w-0 flex-1 content-between gap-2 py-0.5">
						<div>
							<a
								href={resolve('/products/[slug]', { slug: item.productSlug })}
								class="font-medium tracking-tight hover:underline"
							>
								{item.productName}
							</a>
							<p class="mt-1 text-sm text-muted-foreground">{item.variantName}</p>
						</div>
						<div class="flex items-end justify-between gap-3">
							<span
								class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums"
							>
								Qty {item.quantity}
							</span>
							<p class="text-sm font-semibold tabular-nums">{formatPrice(item.lineTotal)}</p>
						</div>
					</div>
				</li>
			{/each}
		</ul>

		<div class="mt-8 rounded-2xl bg-secondary px-5 py-5 text-secondary-foreground">
			<p class="flex justify-between text-sm font-medium">
				<span>Subtotal</span>
				<span class="tabular-nums">{formatPrice(cart.subtotal)}</span>
			</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Shipping and WELCOME10 are chosen at checkout.
			</p>
			<a
				href={resolve('/')}
				class="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
			>
				Keep shopping
			</a>
		</div>
	{/if}
</section>
