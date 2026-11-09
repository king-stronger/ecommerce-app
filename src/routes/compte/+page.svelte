<script lang="ts">
	import { resolve } from '$app/paths';
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

	async function signOut() {
		await authClient.signOut();
	}

	function switchMode(next: 'signin' | 'signup') {
		mode = next;
		authError = '';
	}
</script>

<svelte:head>
	<title>Account · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Account</h1>

	{#if $session.data?.user}
		<p class="mt-4 text-sm text-muted-foreground">{$session.data.user.email}</p>
		<Button class="mt-6 rounded-full" variant="outline" type="button" onclick={signOut}>
			Sign out
		</Button>
	{:else}
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

	<p class="mt-10 text-xs text-muted-foreground">
		<a href={resolve('/')} class="underline underline-offset-4">Back to shop</a>
	</p>
</section>
