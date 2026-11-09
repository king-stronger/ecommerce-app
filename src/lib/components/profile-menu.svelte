<script lang="ts">
	import { resolve } from '$app/paths';
	import { isAdminUser } from '#lib/admin';
	import { authClient } from '#lib/auth-client';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Package from '@lucide/svelte/icons/package';
	import Receipt from '@lucide/svelte/icons/receipt';
	import User from '@lucide/svelte/icons/user';

	let {
		user
	}: {
		user: {
			name?: string | null;
			email: string;
			image?: string | null;
			role?: string | string[] | null;
		};
	} = $props();

	let open = $state(false);
	let rootEl = $state<HTMLDivElement | null>(null);

	const admin = $derived(isAdminUser(user));

	const initials = $derived.by(() => {
		const source = user.name?.trim() || user.email;
		const parts = source.split(/[\s@._-]+/).filter(Boolean);
		return (parts[0]?.[0] ?? 'U').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
	});

	const label = $derived(user.name?.trim() || user.email.split('@')[0] || 'Account');

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	function onDocumentClick(event: MouseEvent) {
		if (!open || !rootEl) return;
		if (!rootEl.contains(event.target as Node)) close();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	async function signOut() {
		close();
		await authClient.signOut();
	}
</script>

<svelte:document onclick={onDocumentClick} onkeydown={onKeydown} />

<div class="relative" bind:this={rootEl}>
	<button
		type="button"
		class="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-foreground text-[11px] font-medium tracking-wide text-background ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
		aria-label="Account menu"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={toggle}
	>
		{#if user.image}
			<img src={user.image} alt="" class="size-full object-cover" />
		{:else}
			{initials}
		{/if}
	</button>

	{#if open}
		<div
			role="menu"
			class="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-background py-1 shadow-[0_18px_40px_-24px_var(--foreground)]"
		>
			<div class="border-b border-border px-3 py-2.5">
				<p class="truncate text-sm font-medium">{label}</p>
				<p class="truncate text-xs text-muted-foreground">{user.email}</p>
			</div>

			{#if admin}
				<a
					href={resolve('/admin')}
					role="menuitem"
					class="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
					onclick={close}
				>
					<LayoutDashboard size={16} strokeWidth={1.7} />
					Dashboard
				</a>
				<a
					href={resolve('/admin/products')}
					role="menuitem"
					class="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
					onclick={close}
				>
					<Package size={16} strokeWidth={1.7} />
					Products
				</a>
				<a
					href={resolve('/admin/categories')}
					role="menuitem"
					class="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
					onclick={close}
				>
					<FolderTree size={16} strokeWidth={1.7} />
					Categories
				</a>
				<a
					href={resolve('/admin/orders')}
					role="menuitem"
					class="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
					onclick={close}
				>
					<Receipt size={16} strokeWidth={1.7} />
					Orders
				</a>
				<div class="my-1 border-t border-border"></div>
			{/if}

			<a
				href={resolve('/compte')}
				role="menuitem"
				class="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
				onclick={close}
			>
				<User size={16} strokeWidth={1.7} />
				Account
			</a>
			<button
				type="button"
				role="menuitem"
				class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-muted"
				onclick={signOut}
			>
				<LogOut size={16} strokeWidth={1.7} />
				Sign out
			</button>
		</div>
	{/if}
</div>
