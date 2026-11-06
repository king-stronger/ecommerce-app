<script lang="ts">
	import { authClient } from '#lib/auth-client';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	const session = authClient.useSession();
	let email = $state('');
	let password = $state('');
	let authError = $state('');

	async function signIn(event: SubmitEvent) {
		event.preventDefault();
		authError = '';
		const result = await authClient.signIn.email({ email, password });
		if (result.error) {
			authError = result.error.message ?? 'Connexion impossible.';
		}
	}

	async function signOut() {
		await authClient.signOut();
	}
</script>

<svelte:head>
	<title>Compte · Boutique</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
	<h1 class="text-3xl font-semibold tracking-tight">Compte</h1>

	{#if $session.data?.user}
		<p class="mt-4 text-sm text-foreground/70">{$session.data.user.email}</p>
		<Button class="mt-6" variant="outline" type="button" onclick={signOut}>Se déconnecter</Button>
	{:else}
		<form class="mt-8 grid gap-4" onsubmit={signIn}>
			<div class="grid gap-1.5">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="username" bind:value={email} required />
			</div>
			<div class="grid gap-1.5">
				<Label for="password">Mot de passe</Label>
				<Input
					id="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					required
				/>
			</div>
			{#if authError}
				<p class="text-sm text-destructive">{authError}</p>
			{/if}
			<Button type="submit">Se connecter</Button>
		</form>
	{/if}
</section>
