<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { isAdminUser } from '#lib/admin';
	import { authClient } from '#lib/auth-client';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const session = authClient.useSession();
	const ready = $derived(!$session.isPending);
	const allowed = $derived(isAdminUser($session.data?.user));

	function navClass(href: string) {
		const active = page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
		return active
			? 'border-b-2 border-background pb-1 text-background'
			: 'pb-1 text-background/70 hover:text-background';
	}
</script>

{#if !ready}
	<section class="mx-auto max-w-5xl px-4 py-16 sm:px-6">
		<p class="text-sm text-muted-foreground">Checking admin access…</p>
	</section>
{:else if !$session.data?.user}
	<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
		<h1 class="font-serif text-3xl tracking-tight">Admin</h1>
		<p class="mt-3 text-sm text-muted-foreground">Sign in with an admin account to continue.</p>
		<a
			href={resolve('/compte')}
			class="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
		>
			Go to login
		</a>
	</section>
{:else if !allowed}
	<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
		<h1 class="font-serif text-3xl tracking-tight">Forbidden</h1>
		<p class="mt-3 text-sm text-muted-foreground">
			{$session.data.user.email} is signed in but is not an admin.
		</p>
		<a href={resolve('/')} class="mt-6 inline-flex text-sm underline underline-offset-4">
			Back to shop
		</a>
	</section>
{:else}
	<div class="min-h-screen">
		<header class="bg-foreground text-background">
			<div class="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
				<a href={resolve('/admin')} class="font-serif text-xl tracking-[0.12em]">FORMA Admin</a>
				<nav class="flex flex-wrap items-center gap-4 text-sm">
					<a href={resolve('/admin/products')} class={navClass('/admin/products')}>Products</a>
					<a href={resolve('/admin/categories')} class={navClass('/admin/categories')}>
						Categories
					</a>
					<a href={resolve('/admin/orders')} class={navClass('/admin/orders')}>Orders</a>
				</nav>
				<div class="ml-auto flex items-center gap-3 text-sm">
					<span class="max-w-40 truncate text-background/70">{$session.data.user.email}</span>
					<a href={resolve('/')} class="underline underline-offset-4">Shop</a>
				</div>
			</div>
		</header>
		{@render children()}
	</div>
{/if}
