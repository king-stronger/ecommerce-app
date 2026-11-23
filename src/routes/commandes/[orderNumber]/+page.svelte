<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getOrdersByOrderNumber, type PostCheckoutResponse } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import PageSkeleton from '#lib/components/page-skeleton.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { onMount } from 'svelte';

	const orderNumber = $derived(page.params.orderNumber ?? '');

	let email = $state('');
	let order = $state<PostCheckoutResponse | undefined>(undefined);
	let loading = $state(true);
	let pending = $state(false);
	let error = $state('');

	onMount(async () => {
		const fromQuery = page.url.searchParams.get('email') ?? '';
		let fromSession = '';
		try {
			fromSession = sessionStorage.getItem(`ecommerce-order-email:${orderNumber}`) ?? '';
			if (fromSession) {
				sessionStorage.removeItem(`ecommerce-order-email:${orderNumber}`);
			}
		} catch {
			// Private mode / SSR-safe no-op.
		}
		email = fromQuery || fromSession;
		if (email && orderNumber) {
			await lookup();
			return;
		}
		loading = false;
	});

	function apiErrorMessage(value: unknown, fallback: string) {
		if (value && typeof value === 'object' && 'message' in value) {
			const message = (value as { message?: unknown }).message;
			if (typeof message === 'string' && message.trim()) return message;
		}
		return fallback;
	}

	async function lookup(event?: SubmitEvent) {
		event?.preventDefault();
		if (!orderNumber || !email.trim()) {
			error = 'Order number and email are required.';
			return;
		}

		error = '';
		pending = true;
		loading = true;
		const result = await getOrdersByOrderNumber({
			path: { orderNumber },
			query: { email: email.trim() }
		});
		pending = false;
		loading = false;

		if (result.error || !result.data) {
			order = undefined;
			error = apiErrorMessage(result.error, 'Order not found for this email.');
			return;
		}

		order = result.data;
	}
</script>

<svelte:head>
	<title>
		{order ? `Order ${order.orderNumber}` : 'Order lookup'} · Ecommerce
	</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">
		{order ? 'Order confirmed' : 'Order lookup'}
	</h1>

	{#if loading}
		<div class="mt-2">
			<PageSkeleton variant="bag" />
		</div>
	{:else if order}
		<p class="mt-2 text-sm text-muted-foreground">
			Thanks{order.shippingAddress.firstName ? `, ${order.shippingAddress.firstName}` : ''}. Your
			order <span class="font-medium text-foreground tabular-nums">{order.orderNumber}</span> is recorded.
		</p>

		<div class="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 text-sm">
			<div class="flex flex-wrap justify-between gap-2">
				<span class="text-muted-foreground">Status</span>
				<span class="capitalize">{order.status}</span>
			</div>
			<div class="flex flex-wrap justify-between gap-2">
				<span class="text-muted-foreground">Payment</span>
				<span class="capitalize">{order.paymentStatus}</span>
			</div>
			<div class="flex flex-wrap justify-between gap-2">
				<span class="text-muted-foreground">Fulfillment</span>
				<span class="capitalize">{order.fulfillmentStatus}</span>
			</div>
			{#if order.shippingMethodName}
				<div class="flex flex-wrap justify-between gap-2">
					<span class="text-muted-foreground">Shipping</span>
					<span>{order.shippingMethodName}</span>
				</div>
			{/if}
		</div>

		<ul class="mt-6 grid gap-3">
			{#each order.items as item (item.id)}
				<li
					class="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4 text-sm"
				>
					<div class="min-w-0">
						<p class="font-medium">{item.productName}</p>
						<p class="text-muted-foreground">
							{item.variantName ?? 'Variant'} · Qty {item.quantity}
						</p>
					</div>
					<p class="shrink-0 tabular-nums">{formatPrice(item.totalAmount)}</p>
				</li>
			{/each}
		</ul>

		<div class="mt-6 rounded-2xl bg-secondary px-5 py-5 text-sm text-secondary-foreground">
			<p class="flex justify-between">
				<span>Subtotal</span>
				<span class="tabular-nums">{formatPrice(order.subtotal)}</span>
			</p>
			<p class="mt-2 flex justify-between">
				<span>Discount</span>
				<span class="tabular-nums">−{formatPrice(order.discountAmount)}</span>
			</p>
			<p class="mt-2 flex justify-between">
				<span>Shipping</span>
				<span class="tabular-nums">{formatPrice(order.shippingAmount)}</span>
			</p>
			<p class="mt-3 flex justify-between border-t border-border/40 pt-3 font-medium">
				<span>Total</span>
				<span class="tabular-nums">{formatPrice(order.totalAmount)}</span>
			</p>
		</div>

		<a
			href={resolve('/')}
			class="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
		>
			Continue shopping
		</a>
	{:else}
		<p class="mt-2 text-sm text-muted-foreground">
			Look up order <span class="font-medium text-foreground tabular-nums">{orderNumber}</span> with the
			email used at checkout.
		</p>
		<form
			class="mt-8 grid max-w-md gap-4 rounded-2xl border border-border bg-card p-5"
			onsubmit={lookup}
		>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" required autocomplete="email" bind:value={email} />
			</div>
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
			<Button type="submit" class="rounded-full" disabled={pending}>
				{pending ? 'Looking up…' : 'Find order'}
			</Button>
		</form>
	{/if}
</section>
