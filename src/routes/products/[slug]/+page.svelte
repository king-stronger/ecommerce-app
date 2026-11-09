<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { postCartItems } from '#lib/api/client';
	import { setCartCount } from '#lib/cart-count.svelte';
	import { formatPrice, productImages } from '#lib/catalog';
	import Truck from '@lucide/svelte/icons/truck';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const images = $derived(productImages(data.product));
	const variants = $derived(data.product.variants.filter((variant) => variant.isActive));

	const optionLabels: Record<string, string> = {
		color: 'Choose a color',
		size: 'Choose a size'
	};

	let pickedId = $state<string | null>(null);
	let pickedProductId = $state<string | null>(null);
	let activeImage = $state(0);
	let activeImageProductId = $state<string | null>(null);
	let quantity = $state(1);
	let quantityProductId = $state<string | null>(null);
	let adding = $state(false);
	let addedProductId = $state<string | null>(null);
	let errorProductId = $state<string | null>(null);
	let addError = $state('');

	const selected = $derived.by(() => {
		if (pickedProductId === data.product.id && pickedId) {
			const picked = variants.find((variant) => variant.id === pickedId);
			if (picked) return picked;
		}
		return variants.find((variant) => variant.isDefault) ?? variants[0];
	});
	const shownImage = $derived(
		activeImageProductId === data.product.id
			? Math.min(activeImage, Math.max(images.length - 1, 0))
			: 0
	);
	const shownQuantity = $derived(quantityProductId === data.product.id ? quantity : 1);
	const added = $derived(addedProductId === data.product.id);
	const visibleError = $derived(errorProductId === data.product.id ? addError : '');

	function optionRecord(variant: (typeof variants)[number]) {
		if (!variant.options || typeof variant.options !== 'object' || Array.isArray(variant.options)) {
			return null;
		}
		const entries = Object.entries(variant.options).filter(
			(entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
		);
		return entries.length > 0 ? Object.fromEntries(entries) : null;
	}

	const optionKeys = $derived.by(() => {
		if (variants.length < 2) return [];
		const maps = variants.map(optionRecord);
		if (maps.some((record) => !record)) return [];
		return [...new Set(maps.flatMap((record) => Object.keys(record ?? {})))];
	});

	function valuesFor(key: string) {
		const current = selected ? optionRecord(selected) : null;
		const values = variants
			.map(optionRecord)
			.filter((record): record is Record<string, string> => !!record)
			.filter((record) =>
				optionKeys
					.filter((other) => other !== key)
					.every((other) => !current || record[other] === current[other])
			)
			.map((record) => record[key]);
		return [...new Set(values)];
	}

	function choose(key: string, value: string) {
		if (!selected) return;
		const current = optionRecord(selected) ?? {};
		const wanted = { ...current, [key]: value };
		const match = variants.find((variant) => {
			const record = optionRecord(variant);
			return record && optionKeys.every((optionKey) => record[optionKey] === wanted[optionKey]);
		});
		const fallback = variants.find((variant) => optionRecord(variant)?.[key] === value);
		pickedProductId = data.product.id;
		pickedId = (match ?? fallback)?.id ?? selected.id;
		addedProductId = null;
		errorProductId = null;
	}

	function chooseVariant(id: string) {
		pickedProductId = data.product.id;
		pickedId = id;
		addedProductId = null;
		errorProductId = null;
	}

	const outOfStock = $derived(
		!!selected && selected.trackInventory && selected.stockQuantity < 1
	);
	const maxQuantity = $derived(
		selected?.trackInventory ? Math.max(selected.stockQuantity, 1) : 99
	);
	const stockLeft = $derived(
		selected?.trackInventory ? selected.stockQuantity : null
	);

	function setQuantity(next: number) {
		quantityProductId = data.product.id;
		quantity = Math.min(Math.max(1, next), maxQuantity);
		addedProductId = null;
	}

	function setImage(index: number) {
		activeImageProductId = data.product.id;
		activeImage = index;
	}

	function swatch(name: string) {
		const map: Record<string, string> = {
			Black: '#1a1a1a',
			White: '#f5f5f5',
			Cream: '#efe6d6',
			Ivory: '#f4efe6',
			Sand: '#d7c4a8',
			Camel: '#c49a6c',
			Taupe: '#8b7b6a',
			Olive: '#5c6b4a',
			Indigo: '#3b4a6b',
			Navy: '#1f2a44',
			Ecru: '#e8e0d0',
			Brown: '#6b4a2f',
			Tortoise: '#7a4e2d',
			Caramel: '#b07a45'
		};
		return map[name] ?? '#cfc8bc';
	}

	async function addToCart(redirect = false) {
		if (!selected || outOfStock || adding) return;
		adding = true;
		addedProductId = null;
		errorProductId = null;
		const result = await postCartItems({
			body: { productVariantId: selected.id, quantity: shownQuantity }
		});
		adding = false;
		if (result.error || !result.data) {
			addError =
				result.error && 'message' in result.error
					? result.error.message
					: 'Could not add this item right now.';
			errorProductId = data.product.id;
			return;
		}
		setCartCount(result.data.items.reduce((sum, item) => sum + item.quantity, 0));
		addedProductId = data.product.id;
		if (redirect) {
			await goto(resolve('/panier'));
		}
	}
</script>

<svelte:head>
	<title>{data.product.name} · FORMA</title>
</svelte:head>

<article class="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-start lg:py-12">
	<div class="grid gap-3">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href={resolve('/')} class="hover:text-foreground">Home</a>
			<span class="mx-1.5">/</span>
			<span>{data.product.name}</span>
		</nav>

		<div class="overflow-hidden rounded-2xl bg-muted">
			{#if images[shownImage]}
				<img
					src={images[shownImage]}
					alt={data.product.name}
					class="aspect-square w-full object-cover"
				/>
			{:else}
				<div class="aspect-square w-full"></div>
			{/if}
		</div>

		{#if images.length > 1}
			<div class="grid grid-cols-4 gap-3">
				{#each images as image, index (image)}
					<button
						type="button"
						class="overflow-hidden rounded-xl bg-muted ring-offset-2 focus-visible:ring-2 focus-visible:ring-foreground {shownImage ===
						index
							? 'ring-2 ring-foreground'
							: ''}"
						onclick={() => setImage(index)}
						aria-label={`Image ${index + 1}`}
						aria-pressed={shownImage === index}
					>
						<img src={image} alt="" class="aspect-square w-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid content-start gap-5 lg:pt-8">
		<div class="grid gap-3">
			<h1 class="font-serif text-4xl tracking-tight">{data.product.name}</h1>
			{#if data.product.shortDescription || data.product.description}
				<p class="max-w-[44ch] text-sm text-muted-foreground">
					{data.product.description || data.product.shortDescription}
				</p>
			{/if}
		</div>

		{#if selected}
			<div class="border-y border-border py-4">
				<p class="flex items-baseline gap-3">
					<span class="text-2xl font-semibold tabular-nums">{formatPrice(selected.price)}</span>
					{#if selected.compareAtPrice > selected.price}
						<span class="text-sm text-muted-foreground line-through tabular-nums">
							{formatPrice(selected.compareAtPrice)}
						</span>
					{/if}
				</p>
			</div>
		{/if}

		{#if variants.length === 0}
			<p class="text-sm">This piece is unavailable.</p>
		{:else if optionKeys.length > 0}
			{#each optionKeys as key (key)}
				<fieldset class="grid gap-3">
					<legend class="text-sm font-medium">{optionLabels[key] ?? key}</legend>
					{#if key === 'color'}
						<div class="flex flex-wrap gap-2">
							{#each valuesFor(key) as value (value)}
								{@const pressed = optionRecord(selected)?.[key] === value}
								<button
									type="button"
									aria-pressed={pressed}
									title={value}
									class="size-9 rounded-full border-2 {pressed
										? 'border-foreground'
										: 'border-transparent ring-1 ring-border'}"
									style={`background:${swatch(value)}`}
									onclick={() => choose(key, value)}
								>
									<span class="sr-only">{value}</span>
								</button>
							{/each}
						</div>
						{#if optionRecord(selected)?.color}
							<p class="text-xs text-muted-foreground">{optionRecord(selected)?.color}</p>
						{/if}
					{:else}
						<div class="flex flex-wrap gap-2">
							{#each valuesFor(key) as value (value)}
								{@const pressed = optionRecord(selected)?.[key] === value}
								<button
									type="button"
									aria-pressed={pressed}
									class="min-w-11 rounded-full border px-3 py-1.5 text-sm {pressed
										? 'border-foreground bg-foreground text-background'
										: 'border-border bg-background hover:bg-muted'}"
									onclick={() => choose(key, value)}
								>
									{value}
								</button>
							{/each}
						</div>
					{/if}
				</fieldset>
			{/each}
		{:else if variants.length > 1}
			<fieldset class="grid gap-3">
				<legend class="text-sm font-medium">Choose a variant</legend>
				<div class="flex flex-wrap gap-2">
					{#each variants as variant (variant.id)}
						<button
							type="button"
							aria-pressed={variant.id === selected?.id}
							class="rounded-full border px-3 py-1.5 text-sm {variant.id === selected?.id
								? 'border-foreground bg-foreground text-background'
								: 'border-border bg-background hover:bg-muted'}"
							onclick={() => chooseVariant(variant.id)}
						>
							{variant.name}
						</button>
					{/each}
				</div>
			</fieldset>
		{/if}

		{#if selected && !outOfStock}
			<div class="flex flex-wrap items-center gap-4">
				<div
					class="inline-flex items-center rounded-full bg-muted px-2 py-1"
					role="group"
					aria-label="Quantity"
				>
					<button
						type="button"
						class="size-9 text-lg"
						onclick={() => setQuantity(shownQuantity - 1)}
						aria-label="Decrease quantity"
					>
						−
					</button>
					<span class="w-8 text-center tabular-nums">{shownQuantity}</span>
					<button
						type="button"
						class="size-9 text-lg"
						onclick={() => setQuantity(shownQuantity + 1)}
						aria-label="Increase quantity"
						disabled={shownQuantity >= maxQuantity}
					>
						+
					</button>
				</div>
				{#if stockLeft !== null && stockLeft <= 20}
					<p class="text-sm text-muted-foreground">
						Only <span class="font-semibold text-primary">{stockLeft} items</span> left.
					</p>
				{/if}
			</div>
		{/if}

		<div class="grid gap-3 sm:grid-cols-2">
			<button
				type="button"
				class="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
				disabled={!selected || outOfStock || adding}
				onclick={() => addToCart(true)}
			>
				{#if outOfStock}
					Sold out
				{:else if adding}
					Adding…
				{:else}
					Buy now
				{/if}
			</button>
			<button
				type="button"
				class="inline-flex h-12 items-center justify-center rounded-full border border-foreground bg-background px-5 text-sm font-medium disabled:opacity-50"
				disabled={!selected || outOfStock || adding}
				onclick={() => addToCart(false)}
			>
				Add to cart
			</button>
		</div>

		{#if visibleError}
			<p class="text-sm text-destructive">{visibleError}</p>
		{:else if added}
			<p class="text-sm">
				Added.
				<a href={resolve('/panier')} class="font-medium underline underline-offset-4">View bag</a>
			</p>
		{/if}

		<div class="grid gap-3 pt-2">
			<div class="flex gap-3 rounded-2xl border border-border p-4">
				<Truck size={20} strokeWidth={1.6} class="mt-0.5 shrink-0" aria-hidden="true" />
				<div class="text-sm">
					<p class="font-medium">Delivery</p>
					<p class="mt-1 text-muted-foreground">
						Standard €4.99 (3–5 days). Express €9.99 (1–2 days). Chosen at checkout.
					</p>
				</div>
			</div>
			<div class="rounded-2xl border border-border p-4 text-sm">
				<p class="font-medium">Welcome offer</p>
				<p class="mt-1 text-muted-foreground">
					WELCOME10 removes 10% from orders of €20 or more (max €15).
				</p>
			</div>
		</div>
	</div>
</article>
