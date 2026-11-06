<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getCart } from '#lib/api/client';
	import { authClient } from '#lib/auth-client';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import { onMount } from 'svelte';

	let { categories }: { categories: Array<{ id: string; name: string; slug: string }> } =
		$props();

	const session = authClient.useSession();
	let cartCount = $state<number | null>(null);

	onMount(async () => {
		const cart = await getCart();
		if (!cart.data) return;
		cartCount = cart.data.items.reduce((sum, item) => sum + item.quantity, 0);
	});

	function categoryCurrent(slug: string) {
		return page.url.pathname === resolve('/categories/[slug]', { slug });
	}
</script>

<header class="sticky top-0 z-20">
	<div class="border-b border-border bg-background">
		<div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
			<a href={resolve('/')} class="text-lg font-semibold tracking-tight">Boutique</a>

			<div class="ml-auto flex items-center gap-2">
				{#if $session.data?.user}
					<a
						href={resolve('/compte')}
						class="max-w-36 truncate rounded-full px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary sm:max-w-56"
					>
						{$session.data.user.email}
					</a>
				{:else}
					<a
						href={resolve('/compte')}
						class="rounded-full px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary"
					>
						Compte
					</a>
				{/if}
				<a
					href={resolve('/panier')}
					class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-secondary"
				>
					<ShoppingBag size={18} strokeWidth={1.75} aria-hidden="true" />
					<span>Panier</span>
					{#if cartCount}
						<span class="tabular-nums">{cartCount}</span>
					{/if}
				</a>
			</div>
		</div>
	</div>

	{#if categories.length > 0}
		<nav class="bg-accent text-accent-foreground" aria-label="Rayons">
			<div class="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
				<span class="shrink-0 pr-2 text-sm font-semibold">Rayons</span>
				{#each categories as category (category.id)}
					<a
						href={resolve('/categories/[slug]', { slug: category.slug })}
						class="shrink-0 rounded-full px-3 py-1.5 text-sm hover:bg-accent-foreground/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-foreground aria-[current=page]:bg-accent-foreground/20"
						aria-current={categoryCurrent(category.slug) ? 'page' : undefined}
					>
						{category.name}
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</header>
