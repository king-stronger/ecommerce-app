<script lang="ts">
	import { resolve } from '$app/paths';
	import { isAdminUser } from '#lib/admin';
	import { authClient } from '#lib/auth-client';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const session = authClient.useSession();
	const ready = $derived(!$session.isPending);
	const allowed = $derived(isAdminUser($session.data?.user));
</script>

{#if !ready}
	<section class="mx-auto max-w-5xl px-4 py-16 sm:px-6" aria-busy="true">
		<span class="sr-only">Checking admin access</span>
		<div class="mb-8 h-9 w-56 animate-pulse rounded bg-muted"></div>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each [1, 2, 3] as item (item)}
				<div class="h-28 animate-pulse rounded-2xl bg-muted"></div>
			{/each}
		</div>
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
	{@render children()}
{/if}
