<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getCart } from '#lib/api/client';
	import { authClient } from '#lib/auth-client';
	import { getCartCount, setCartCount } from '#lib/cart-count.svelte';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import { onMount } from 'svelte';

	let {
		categories
	}: {
		categories: Array<{ id: string; name: string; slug: string; image?: string | null }>;
	} = $props();

	const session = authClient.useSession();
	const cartCount = $derived(getCartCount());

	onMount(async () => {
		const cart = await getCart();
		if (!cart.data) return;
		setCartCount(cart.data.items.reduce((sum, item) => sum + item.quantity, 0));
	});

	function categoryCurrent(slug: string) {
		return page.url.pathname === resolve('/categories/[slug]', { slug });
	}
</script>

<header class="sticky top-0 z-20">
	<div class="bg-promo text-promo-foreground">
		<p class="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide sm:px-6">
			STANDARD €4.99 · EXPRESS €9.99 — WELCOME10 TAKES 10% OFF FROM €20
		</p>
	</div>

	<div class="border-b border-border bg-background">
		<div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
			<a href={resolve('/')} class="font-serif text-2xl tracking-[0.12em]">FORMA</a>

			<div class="ml-auto flex items-center gap-3">
				{#if $session.data?.user}
					<a
						href={resolve('/compte')}
						class="max-w-28 truncate text-sm text-muted-foreground hover:text-foreground sm:max-w-40"
					>
						{$session.data.user.email}
					</a>
				{:else}
					<a href={resolve('/compte')} class="text-sm text-muted-foreground hover:text-foreground">
						Login
					</a>
				{/if}
				<a
					href={resolve('/panier')}
					class="inline-flex items-center gap-1.5 text-sm hover:text-foreground"
					aria-label="Bag"
				>
					<ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
					{#if cartCount}
						<span class="tabular-nums">{cartCount}</span>
					{/if}
				</a>
			</div>
		</div>
	</div>

	{#if categories.length > 0}
		<nav class="border-b border-border bg-foreground text-background" aria-label="Departments">
			<div
				class="mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:thin] sm:px-5"
			>
				<a
					href={resolve('/')}
					class="shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap hover:bg-background/10 aria-[current=page]:bg-background/15"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
				>
					Home
				</a>
				{#each categories as category (category.id)}
					<a
						href={resolve('/categories/[slug]', { slug: category.slug })}
						class="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm whitespace-nowrap hover:bg-background/10 aria-[current=page]:bg-background/15"
						aria-current={categoryCurrent(category.slug) ? 'page' : undefined}
					>
						{#if category.image}
							<img
								src={category.image}
								alt=""
								class="size-6 rounded-full object-cover ring-1 ring-background/20"
							/>
						{/if}
						{category.name}
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</header>
