<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getCart } from '#lib/api/client';
	import { authClient } from '#lib/auth-client';
	import { getCartCount, setCartCount } from '#lib/cart-count.svelte';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import { onMount } from 'svelte';

	let { categories }: { categories: Array<{ id: string; name: string; slug: string }> } =
		$props();

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
		<div
			class="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 sm:px-6"
		>
			<nav class="hidden items-center gap-5 md:flex" aria-label="Shop">
				<a href={resolve('/')} class="text-sm" aria-current={page.url.pathname === '/' ? 'page' : undefined}>
					Home
				</a>
				{#each categories as category (category.id)}
					<a
						href={resolve('/categories/[slug]', { slug: category.slug })}
						class="text-sm text-muted-foreground hover:text-foreground"
						aria-current={categoryCurrent(category.slug) ? 'page' : undefined}
					>
						{category.name}
					</a>
				{/each}
			</nav>

			<a
				href={resolve('/')}
				class="justify-self-start font-serif text-2xl tracking-[0.12em] md:justify-self-center"
			>
				FORMA
			</a>

			<div class="flex items-center justify-end gap-3">
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

		<nav
			class="flex gap-4 overflow-x-auto border-t border-border px-4 py-2.5 md:hidden"
			aria-label="Shop"
		>
			{#each categories as category (category.id)}
				<a
					href={resolve('/categories/[slug]', { slug: category.slug })}
					class="shrink-0 text-sm text-muted-foreground"
					aria-current={categoryCurrent(category.slug) ? 'page' : undefined}
				>
					{category.name}
				</a>
			{/each}
		</nav>
	</div>
</header>
