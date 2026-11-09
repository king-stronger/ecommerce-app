<script lang="ts">
	import { getAdminOrders, patchAdminOrdersById } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import { Button } from '#lib/components/ui/button/index.js';
	import { onMount } from 'svelte';

	type Order = NonNullable<Awaited<ReturnType<typeof getAdminOrders>>['data']>[number];

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let error = $state('');
	let busyId = $state<string | null>(null);

	const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

	async function load() {
		loading = true;
		error = '';
		const result = await getAdminOrders();
		loading = false;
		if (result.error || !result.data) {
			error = 'Could not load orders.';
			return;
		}
		orders = result.data;
	}

	onMount(load);

	async function updateStatus(order: Order, status: (typeof statuses)[number]) {
		busyId = order.id;
		const result = await patchAdminOrdersById({
			path: { id: order.id },
			body: { status }
		});
		busyId = null;
		if (result.error) {
			error = 'Could not update order status.';
			return;
		}
		await load();
	}
</script>

<svelte:head>
	<title>Orders · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
	<h1 class="font-serif text-3xl tracking-tight">Orders</h1>
	<p class="mt-2 text-sm text-muted-foreground">Track and update order status.</p>

	{#if error}
		<p class="mt-6 text-sm text-destructive">{error}</p>
	{/if}

	{#if loading}
		<p class="mt-8 text-sm text-muted-foreground">Loading orders…</p>
	{:else if orders.length === 0}
		<p class="mt-8 text-sm text-muted-foreground">No orders yet.</p>
	{:else}
		<div class="mt-8 overflow-x-auto">
			<table class="w-full min-w-[44rem] border-collapse text-left text-sm">
				<thead>
					<tr class="border-b border-border text-xs tracking-[0.12em] text-muted-foreground uppercase">
						<th class="py-3 pr-3 font-medium">Order</th>
						<th class="py-3 pr-3 font-medium">Customer</th>
						<th class="py-3 pr-3 font-medium">Total</th>
						<th class="py-3 pr-3 font-medium">Status</th>
						<th class="py-3 font-medium">Update</th>
					</tr>
				</thead>
				<tbody>
					{#each orders as order (order.id)}
						<tr class="border-b border-border/70 align-top">
							<td class="py-3 pr-3">
								<p class="font-medium tabular-nums">{order.orderNumber}</p>
								<p class="text-xs text-muted-foreground">
									{new Date(order.createdAt).toLocaleString()}
								</p>
							</td>
							<td class="py-3 pr-3">
								<p>{order.customerEmail}</p>
								<p class="text-xs text-muted-foreground">
									{order.shippingAddress?.city ?? '—'}
								</p>
							</td>
							<td class="py-3 pr-3 tabular-nums">{formatPrice(order.totalAmount)}</td>
							<td class="py-3 pr-3 capitalize">{order.status}</td>
							<td class="py-3">
								<div class="flex flex-wrap gap-2">
									{#each statuses as status}
										<Button
											size="sm"
											variant={order.status === status ? 'default' : 'outline'}
											class="rounded-full capitalize"
											disabled={busyId === order.id || order.status === status}
											onclick={() => updateStatus(order, status)}
										>
											{status}
										</Button>
									{/each}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
