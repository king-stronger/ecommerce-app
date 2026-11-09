<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/site-header.svelte';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children, data }: LayoutProps = $props();
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
		{@render children()}
	</main>
</div>
