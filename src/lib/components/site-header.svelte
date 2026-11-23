<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getCart } from '#lib/api/client';
	import { authClient } from '#lib/auth-client';
	import { getCartCount, setCartCount } from '#lib/cart-count.svelte';
	import ProfileMenu from '#lib/components/profile-menu.svelte';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	const PROMO_DISMISS_KEY = 'ecommerce-promo-dismissed';

	let {
		categories
	}: {
		categories: Array<{ id: string; name: string; slug: string; image?: string | null }>;
	} = $props();

	const session = authClient.useSession();
	const cartCount = $derived(getCartCount());
	let promoOpen = $state(true);

	onMount(async () => {
		try {
			if (localStorage.getItem(PROMO_DISMISS_KEY) === '1') {
				promoOpen = false;
			}
		} catch {
			// Private mode / storage unavailable.
		}

		const cart = await getCart();
		if (!cart.data) return;
		setCartCount(cart.data.items.reduce((sum, item) => sum + item.quantity, 0));
	});

	function dismissPromo() {
		promoOpen = false;
		try {
			localStorage.setItem(PROMO_DISMISS_KEY, '1');
		} catch {
			// Private mode / storage unavailable.
		}
	}

	function categoryCurrent(slug: string) {
		return page.url.pathname === resolve('/categories/[slug]', { slug });
	}
</script>

<header class="sticky top-0 z-20">
	{#if promoOpen}
		<div class="bg-promo text-promo-foreground">
			<div class="relative mx-auto max-w-6xl px-4 py-2 sm:px-6">
				<p class="pr-8 text-center text-xs tracking-wide">
					STANDARD €4.99 · EXPRESS €9.99 — WELCOME10 TAKES 10% OFF FROM €20
				</p>
				<button
					type="button"
					class="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-promo-foreground/80 transition hover:bg-foreground/5 hover:text-promo-foreground sm:right-5"
					aria-label="Dismiss promo"
					onclick={dismissPromo}
				>
					<X size={14} strokeWidth={2} aria-hidden="true" />
				</button>
			</div>
		</div>
	{/if}

	<div class="border-b border-border bg-background">
		<div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
			<a href={resolve('/')} class="font-serif text-2xl tracking-[0.12em]">Ecommerce</a>

			<div class="ml-auto flex items-center gap-3">
				{#if $session.isPending}
					<div class="size-8 animate-pulse rounded-full bg-muted" aria-hidden="true"></div>
				{:else if $session.data?.user}
					<ProfileMenu user={$session.data.user} />
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
				class="mx-auto flex max-w-6xl [scrollbar-width:thin] items-stretch gap-1 overflow-x-auto px-3 py-2 sm:px-5"
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
