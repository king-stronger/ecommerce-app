<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		getCart,
		getShippingMethods,
		postCheckout,
		type GetShippingMethodsResponses,
		type PostCheckoutData
	} from '#lib/api/client';
	import { authClient } from '#lib/auth-client';
	import { formatPrice } from '#lib/catalog';
	import { setCartCount } from '#lib/cart-count.svelte';
	import PageSkeleton from '#lib/components/page-skeleton.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { onMount } from 'svelte';

	type Address = PostCheckoutData['body']['shippingAddress'];
	type ShippingMethod = GetShippingMethodsResponses[200][number];

	const session = authClient.useSession();

	let cart = $state<Awaited<ReturnType<typeof getCart>>['data']>(undefined);
	let shippingMethods = $state<ShippingMethod[]>([]);
	let failed = $state(false);
	let pending = $state(false);
	let error = $state('');
	let sameAsShipping = $state(true);
	let syncedUserId = $state<string | null>(null);

	let customerEmail = $state('');
	let customerPhone = $state('');
	let customerFirstName = $state('');
	let customerLastName = $state('');
	let couponCode = $state('');
	let notes = $state('');
	let shippingMethodId = $state('');

	let shipping = $state<Address>({
		firstName: '',
		lastName: '',
		phone: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		postalCode: '',
		country: 'IE'
	});
	let billing = $state<Address>({
		firstName: '',
		lastName: '',
		phone: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		postalCode: '',
		country: 'IE'
	});

	const selectedShipping = $derived(
		shippingMethods.find((method) => method.id === shippingMethodId) ?? null
	);
	const estimatedTotal = $derived(cart ? cart.subtotal + (selectedShipping?.price ?? 0) : 0);

	$effect(() => {
		const user = $session.data?.user;
		if (!user || user.id === syncedUserId) return;
		syncedUserId = user.id;
		customerEmail = user.email ?? customerEmail;
		customerFirstName = user.name?.trim().split(/\s+/)[0] || customerFirstName;
		const rest = user.name?.trim().split(/\s+/).slice(1).join(' ');
		if (rest) customerLastName = rest;
		if (!shipping.firstName) shipping.firstName = customerFirstName;
		if (!shipping.lastName && rest) shipping.lastName = rest;
	});

	onMount(async () => {
		const [cartResult, shippingResult] = await Promise.all([getCart(), getShippingMethods()]);
		if (cartResult.error || !cartResult.data) {
			failed = true;
			return;
		}
		cart = cartResult.data;
		setCartCount(cartResult.data.items.reduce((sum, item) => sum + item.quantity, 0));

		if (shippingResult.data?.length) {
			shippingMethods = shippingResult.data;
			shippingMethodId = shippingResult.data[0]?.id ?? '';
		}
	});

	function apiErrorMessage(value: unknown, fallback: string) {
		if (value && typeof value === 'object' && 'message' in value) {
			const message = (value as { message?: unknown }).message;
			if (typeof message === 'string' && message.trim()) return message;
		}
		return fallback;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!cart || cart.items.length === 0) return;

		error = '';
		pending = true;

		const shippingAddress: Address = {
			...shipping,
			firstName: shipping.firstName.trim() || customerFirstName.trim(),
			lastName: shipping.lastName?.trim() || undefined,
			phone: shipping.phone?.trim() || customerPhone.trim() || undefined,
			addressLine1: shipping.addressLine1.trim(),
			addressLine2: shipping.addressLine2?.trim() || undefined,
			city: shipping.city.trim(),
			state: shipping.state.trim(),
			postalCode: shipping.postalCode.trim(),
			country: shipping.country.trim().toUpperCase()
		};

		const billingAddress: Address = sameAsShipping
			? { ...shippingAddress }
			: {
					...billing,
					firstName: billing.firstName.trim() || customerFirstName.trim(),
					lastName: billing.lastName?.trim() || undefined,
					phone: billing.phone?.trim() || customerPhone.trim() || undefined,
					addressLine1: billing.addressLine1.trim(),
					addressLine2: billing.addressLine2?.trim() || undefined,
					city: billing.city.trim(),
					state: billing.state.trim(),
					postalCode: billing.postalCode.trim(),
					country: billing.country.trim().toUpperCase()
				};

		const result = await postCheckout({
			body: {
				customerEmail: customerEmail.trim(),
				customerPhone: customerPhone.trim() || undefined,
				customerFirstName: customerFirstName.trim(),
				customerLastName: customerLastName.trim() || undefined,
				shippingAddress,
				billingAddress,
				shippingMethodId: shippingMethodId || undefined,
				couponCode: couponCode.trim() || undefined,
				currency: 'EUR',
				notes: notes.trim() || undefined
			}
		});

		pending = false;

		if (result.error || !result.data) {
			error = apiErrorMessage(result.error, 'Checkout failed. Check your bag and try again.');
			return;
		}

		setCartCount(0);
		try {
			sessionStorage.setItem(
				`ecommerce-order-email:${result.data.orderNumber}`,
				result.data.customerEmail
			);
		} catch {
			// Private mode / SSR-safe no-op.
		}
		await goto(resolve('/commandes/[orderNumber]', { orderNumber: result.data.orderNumber }));
	}
</script>

<svelte:head>
	<title>Checkout · Ecommerce</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Checkout</h1>
	<p class="mt-2 text-sm text-muted-foreground">
		Guest checkout — no payment charge. Shipping and WELCOME10 apply here.
	</p>

	{#if failed}
		<p class="mt-6 text-sm">Checkout could not load. Try again in a moment.</p>
	{:else if !cart}
		<div class="mt-2">
			<PageSkeleton variant="bag" />
		</div>
	{:else if cart.items.length === 0}
		<div
			class="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center"
		>
			<p class="text-sm text-muted-foreground">Your bag is empty.</p>
			<a
				href={resolve('/')}
				class="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
			>
				Continue shopping
			</a>
		</div>
	{:else}
		<form class="mt-8 grid gap-8" onsubmit={submit}>
			<section class="rounded-2xl border border-border bg-card p-5">
				<h2 class="text-sm font-medium tracking-wide uppercase">Bag</h2>
				<ul class="mt-4 grid gap-3">
					{#each cart.items as item (item.id)}
						<li class="flex items-start justify-between gap-4 text-sm">
							<div class="min-w-0">
								<p class="font-medium">{item.productName}</p>
								<p class="text-muted-foreground">
									{item.variantName} · Qty {item.quantity}
								</p>
							</div>
							<p class="shrink-0 tabular-nums">{formatPrice(item.lineTotal)}</p>
						</li>
					{/each}
				</ul>
				<p class="mt-4 flex justify-between border-t border-border pt-4 text-sm font-medium">
					<span>Subtotal</span>
					<span class="tabular-nums">{formatPrice(cart.subtotal)}</span>
				</p>
			</section>

			<section class="grid gap-4 rounded-2xl border border-border bg-card p-5">
				<h2 class="text-sm font-medium tracking-wide uppercase">Contact</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2 sm:col-span-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							required
							autocomplete="email"
							bind:value={customerEmail}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="firstName">First name</Label>
						<Input
							id="firstName"
							required
							autocomplete="given-name"
							bind:value={customerFirstName}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="lastName">Last name</Label>
						<Input id="lastName" autocomplete="family-name" bind:value={customerLastName} />
					</div>
					<div class="grid gap-2 sm:col-span-2">
						<Label for="phone">Phone (optional)</Label>
						<Input id="phone" type="tel" autocomplete="tel" bind:value={customerPhone} />
					</div>
				</div>
			</section>

			<section class="grid gap-4 rounded-2xl border border-border bg-card p-5">
				<h2 class="text-sm font-medium tracking-wide uppercase">Shipping address</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2 sm:col-span-2">
						<Label for="ship-line1">Address</Label>
						<Input
							id="ship-line1"
							required
							autocomplete="address-line1"
							bind:value={shipping.addressLine1}
						/>
					</div>
					<div class="grid gap-2 sm:col-span-2">
						<Label for="ship-line2">Apartment, suite (optional)</Label>
						<Input
							id="ship-line2"
							autocomplete="address-line2"
							bind:value={shipping.addressLine2}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="ship-city">City</Label>
						<Input
							id="ship-city"
							required
							autocomplete="address-level2"
							bind:value={shipping.city}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="ship-state">County / state</Label>
						<Input
							id="ship-state"
							required
							autocomplete="address-level1"
							bind:value={shipping.state}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="ship-postal">Postal code</Label>
						<Input
							id="ship-postal"
							required
							autocomplete="postal-code"
							bind:value={shipping.postalCode}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="ship-country">Country (ISO)</Label>
						<Input
							id="ship-country"
							required
							maxlength={2}
							autocomplete="country"
							bind:value={shipping.country}
						/>
					</div>
				</div>
				<label class="mt-1 flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						bind:checked={sameAsShipping}
						class="size-4 rounded border-input"
					/>
					Billing address same as shipping
				</label>
			</section>

			{#if !sameAsShipping}
				<section class="grid gap-4 rounded-2xl border border-border bg-card p-5">
					<h2 class="text-sm font-medium tracking-wide uppercase">Billing address</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="grid gap-2 sm:col-span-2">
							<Label for="bill-line1">Address</Label>
							<Input id="bill-line1" required bind:value={billing.addressLine1} />
						</div>
						<div class="grid gap-2">
							<Label for="bill-city">City</Label>
							<Input id="bill-city" required bind:value={billing.city} />
						</div>
						<div class="grid gap-2">
							<Label for="bill-state">County / state</Label>
							<Input id="bill-state" required bind:value={billing.state} />
						</div>
						<div class="grid gap-2">
							<Label for="bill-postal">Postal code</Label>
							<Input id="bill-postal" required bind:value={billing.postalCode} />
						</div>
						<div class="grid gap-2">
							<Label for="bill-country">Country (ISO)</Label>
							<Input id="bill-country" required maxlength={2} bind:value={billing.country} />
						</div>
					</div>
				</section>
			{/if}

			<section class="grid gap-4 rounded-2xl border border-border bg-card p-5">
				<h2 class="text-sm font-medium tracking-wide uppercase">Shipping & coupon</h2>
				{#if shippingMethods.length === 0}
					<p class="text-sm text-muted-foreground">No shipping methods available.</p>
				{:else}
					<div class="grid gap-2">
						{#each shippingMethods as method (method.id)}
							<label
								class="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm has-checked:border-foreground"
							>
								<input
									type="radio"
									name="shippingMethod"
									class="mt-1"
									value={method.id}
									bind:group={shippingMethodId}
								/>
								<span class="min-w-0 flex-1">
									<span class="flex justify-between gap-3 font-medium">
										<span>{method.name}</span>
										<span class="tabular-nums">{formatPrice(method.price)}</span>
									</span>
									{#if method.description}
										<span class="mt-1 block text-muted-foreground">{method.description}</span>
									{/if}
									<span class="mt-1 block text-xs text-muted-foreground">
										{method.estimatedMinDays}–{method.estimatedMaxDays} days
									</span>
								</span>
							</label>
						{/each}
					</div>
				{/if}
				<div class="grid gap-2">
					<Label for="coupon">Coupon (optional)</Label>
					<Input id="coupon" placeholder="WELCOME10" bind:value={couponCode} />
				</div>
				<div class="grid gap-2">
					<Label for="notes">Order notes (optional)</Label>
					<Input id="notes" bind:value={notes} />
				</div>
			</section>

			<div class="rounded-2xl bg-secondary px-5 py-5 text-secondary-foreground">
				<p class="flex justify-between text-sm">
					<span>Subtotal</span>
					<span class="tabular-nums">{formatPrice(cart.subtotal)}</span>
				</p>
				<p class="mt-2 flex justify-between text-sm">
					<span>Shipping</span>
					<span class="tabular-nums">
						{selectedShipping ? formatPrice(selectedShipping.price) : '—'}
					</span>
				</p>
				<p class="mt-3 flex justify-between border-t border-border/40 pt-3 text-sm font-medium">
					<span>Estimated total</span>
					<span class="tabular-nums">{formatPrice(estimatedTotal)}</span>
				</p>
				<p class="mt-2 text-xs text-muted-foreground">
					Coupon discount is applied by the API when valid. Final total may be lower.
				</p>
				{#if error}
					<p class="mt-3 text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" class="mt-4 w-full rounded-full" disabled={pending}>
					{pending ? 'Placing order…' : 'Place order'}
				</Button>
				<a
					href={resolve('/panier')}
					class="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
				>
					Back to bag
				</a>
			</div>
		</form>
	{/if}
</section>
