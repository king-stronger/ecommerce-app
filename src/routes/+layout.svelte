<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import PageSkeleton from '#lib/components/page-skeleton.svelte';
	import SiteHeader from '#lib/components/site-header.svelte';
	import { navigating, page } from '$app/state';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children, data }: LayoutProps = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));

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
	{#if !isAdminRoute}
		<a
			href="#content"
			class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:bg-background focus:px-3 focus:py-2"
		>
			Skip to content
		</a>
		<SiteHeader categories={data.categories} />
	{/if}
	<main id="content">
		{#if navigating?.to && !isAdminRoute && !(navigating.to.url.pathname.startsWith('/admin'))}
			<div aria-busy="true" aria-live="polite">
				<span class="sr-only">Loading page</span>
				<PageSkeleton variant={skeletonVariant} />
			</div>
		{:else}
			{@render children()}
		{/if}
	</main>
</div>
