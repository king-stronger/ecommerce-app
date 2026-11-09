<script lang="ts">
	import { resolve } from '$app/paths';
	import { isAdminUser } from '#lib/admin';
	import { authClient } from '#lib/auth-client';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	const session = authClient.useSession();
	let mode = $state<'signin' | 'signup'>('signin');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let authError = $state('');
	let pending = $state(false);

	let profileName = $state('');
	let profileMessage = $state('');
	let profileError = $state('');
	let profilePending = $state(false);
	let syncedUserId = $state<string | null>(null);

	$effect(() => {
		const user = $session.data?.user;
		if (!user || user.id === syncedUserId) return;
		syncedUserId = user.id;
		profileName = user.name ?? '';
		profileMessage = '';
		profileError = '';
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		authError = '';
		pending = true;
		try {
			if (mode === 'signin') {
				const result = await authClient.signIn.email({ email, password });
				if (result.error) {
					authError = result.error.message ?? 'Could not sign in.';
				}
				return;
			}

			const result = await authClient.signUp.email({
				email,
				password,
				name: name.trim() || email.split('@')[0] || 'Customer'
			});
			if (result.error) {
				authError = result.error.message ?? 'Could not create your account.';
			}
		} finally {
			pending = false;
		}
	}

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		profileError = '';
		profileMessage = '';
		profilePending = true;
		const result = await authClient.updateUser({ name: profileName.trim() });
		profilePending = false;
		if (result.error) {
			profileError = result.error.message ?? 'Could not update your profile.';
			return;
		}
		profileMessage = 'Profile updated.';
	}

	async function signOut() {
		await authClient.signOut();
	}

	function switchMode(next: 'signin' | 'signup') {
		mode = next;
		authError = '';
	}

	function memberSince(value: string | Date | undefined) {
		if (!value) return '—';
		return new Date(value).toLocaleDateString('en-IE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Account · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-14 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Account</h1>

	{#if $session.isPending}
		<div class="mt-8 grid gap-4" aria-hidden="true">
			<div class="h-28 animate-pulse rounded-2xl bg-muted"></div>
			<div class="h-40 animate-pulse rounded-2xl bg-muted"></div>
		</div>
	{:else if $session.data?.user}
		{@const user = $session.data.user}
		<p class="mt-2 text-sm text-muted-foreground">Manage your FORMA profile and session.</p>

		<div class="mt-8 rounded-2xl border border-border bg-card p-5">
			<div class="flex items-start gap-4">
				{#if user.image}
					<img src={user.image} alt="" class="size-14 rounded-full object-cover" />
				{:else}
					<span
						class="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-sm font-medium tracking-wide text-background"
					>
						{(user.name?.trim() || user.email).slice(0, 2).toUpperCase()}
					</span>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="font-medium">{user.name?.trim() || 'FORMA customer'}</p>
					<p class="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
					<p class="mt-3 text-xs tracking-[0.12em] text-muted-foreground uppercase">
						{isAdminUser(user) ? 'Admin' : 'Customer'} · since {memberSince(user.createdAt)}
					</p>
				</div>
			</div>
		</div>

		<form class="mt-6 grid gap-4 rounded-2xl border border-border p-5" onsubmit={saveProfile}>
			<p class="text-sm font-medium">Profile</p>
			<div class="grid gap-1.5">
				<Label for="profile-name">Display name</Label>
				<Input id="profile-name" bind:value={profileName} autocomplete="name" required />
			</div>
			<div class="grid gap-1.5">
				<Label for="profile-email">Email</Label>
				<Input id="profile-email" value={user.email} disabled />
			</div>
			{#if profileError}
				<p class="text-sm text-destructive">{profileError}</p>
			{/if}
			{#if profileMessage}
				<p class="text-sm text-muted-foreground">{profileMessage}</p>
			{/if}
			<Button class="w-fit rounded-full" type="submit" disabled={profilePending}>
				Save profile
			</Button>
		</form>

		<div class="mt-6 rounded-2xl border border-border p-5">
			<p class="text-sm font-medium">Shopping</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Use WELCOME10 at checkout for 10% off from €20 (cap €15). Your bag stays on this browser until
				checkout.
			</p>
			<div class="mt-4 flex flex-wrap gap-3 text-sm">
				<a href={resolve('/panier')} class="font-medium hover:opacity-80">Open bag →</a>
				<a href={resolve('/')} class="font-medium hover:opacity-80">Continue shopping →</a>
				{#if isAdminUser(user)}
					<a href={resolve('/admin')} class="font-medium hover:opacity-80">Admin dashboard →</a>
				{/if}
			</div>
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<Button class="rounded-full" variant="outline" type="button" onclick={signOut}>
				Sign out
			</Button>
		</div>
	{:else}
		<p class="mt-2 text-sm text-muted-foreground">Sign in to save your details for checkout.</p>

		<div class="mt-6 flex gap-4 text-sm">
			<button
				type="button"
				class="border-b-2 pb-1 transition-colors"
				class:border-foreground={mode === 'signin'}
				class:border-transparent={mode !== 'signin'}
				class:text-muted-foreground={mode !== 'signin'}
				onclick={() => switchMode('signin')}
			>
				Sign in
			</button>
			<button
				type="button"
				class="border-b-2 pb-1 transition-colors"
				class:border-foreground={mode === 'signup'}
				class:border-transparent={mode !== 'signup'}
				class:text-muted-foreground={mode !== 'signup'}
				onclick={() => switchMode('signup')}
			>
				Create account
			</button>
		</div>

		<form class="mt-8 grid gap-4" onsubmit={submit}>
			{#if mode === 'signup'}
				<div class="grid gap-1.5">
					<Label for="name">Name</Label>
					<Input id="name" type="text" autocomplete="name" bind:value={name} />
				</div>
			{/if}
			<div class="grid gap-1.5">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="username" bind:value={email} required />
			</div>
			<div class="grid gap-1.5">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
					bind:value={password}
					required
					minlength={8}
				/>
			</div>
			{#if authError}
				<p class="text-sm text-destructive">{authError}</p>
			{/if}
			<Button class="rounded-full" type="submit" disabled={pending}>
				{mode === 'signin' ? 'Sign in' : 'Create account'}
			</Button>
		</form>

		<p class="mt-6 text-sm text-muted-foreground">
			{#if mode === 'signin'}
				New here?
				<button type="button" class="underline underline-offset-4" onclick={() => switchMode('signup')}>
					Create an account
				</button>
			{:else}
				Already have an account?
				<button type="button" class="underline underline-offset-4" onclick={() => switchMode('signin')}>
					Sign in
				</button>
			{/if}
		</p>
	{/if}
</section>
