<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import PageSkeleton from '#lib/components/page-skeleton.svelte';
	import SiteHeader from '#lib/components/site-header.svelte';
	import { navigating } from '$app/state';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children, data }: LayoutProps = $props();

	const skeletonVariant = $derived.by(() => {
		const path = navigating?.to?.url.pathname ?? '';
		if (path.startsWith('/products/')) return 'product' as const;
		if (path.startsWith('/panier')) return 'bag' as const;
		return 'page' as const;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<a
		href="#content"
		class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:bg-background focus:px-3 focus:py-2"
	>
		Skip to content
	</a>
	<SiteHeader categories={data.categories} />
	<main id="content">
		{#if navigating?.to}
			<div aria-busy="true" aria-live="polite">
				<span class="sr-only">Loading page</span>
				{#if navigating.to.url.pathname.startsWith('/admin')}
					<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6" aria-hidden="true">
						<div class="mb-8 h-9 w-48 animate-pulse rounded bg-muted"></div>
						<div class="mb-4 h-10 w-full max-w-xl animate-pulse rounded bg-muted"></div>
						<div class="grid gap-3">
							{#each [1, 2, 3, 4, 5] as row (row)}
								<div class="h-14 animate-pulse rounded-xl bg-muted"></div>
							{/each}
						</div>
					</section>
				{:else}
					<PageSkeleton variant={skeletonVariant} />
				{/if}
			</div>
		{:else}
			{@render children()}
		{/if}
	</main>
</div>
