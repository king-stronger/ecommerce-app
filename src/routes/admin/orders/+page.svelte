<script lang="ts">
	import { getAdminOrders, patchAdminOrdersById } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import AdminTableSkeleton from '#lib/components/admin-table-skeleton.svelte';
	import ListPagination from '#lib/components/list-pagination.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { onMount } from 'svelte';

	type Order = NonNullable<Awaited<ReturnType<typeof getAdminOrders>>['data']>['items'][number];

	const PAGE_SIZE = 10;
	const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

	let orders = $state<Order[]>([]);
	let total = $state(0);
	let offset = $state(0);
	let status = $state<'all' | (typeof statuses)[number]>('all');
	let search = $state('');
	let draftSearch = $state('');
	let loading = $state(true);
	let error = $state('');
	let busyId = $state<string | null>(null);

	async function load() {
		loading = true;
		error = '';
		const result = await getAdminOrders({
			query: {
				limit: PAGE_SIZE,
				offset,
				...(status !== 'all' ? { status } : {}),
				...(search.trim() ? { q: search.trim() } : {})
			}
		});
		loading = false;
		if (result.error || !result.data) {
			error = 'Could not load orders.';
			orders = [];
			total = 0;
			return;
		}
		orders = result.data.items;
		total = result.data.total;
	}

	onMount(load);

	function applyFilters(event: SubmitEvent) {
		event.preventDefault();
		search = draftSearch;
		offset = 0;
		void load();
	}

	function changeStatus(next: typeof status) {
		status = next;
		offset = 0;
		void load();
	}

	async function updateStatus(order: Order, next: (typeof statuses)[number]) {
		busyId = order.id;
		const result = await patchAdminOrdersById({
			path: { id: order.id },
			body: { status: next }
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

	<form class="mt-8 flex flex-wrap items-end gap-3" onsubmit={applyFilters}>
		<div class="min-w-48 flex-1">
			<label class="mb-1.5 block text-xs tracking-[0.12em] text-muted-foreground uppercase" for="q">
				Search
			</label>
			<Input id="q" placeholder="Order number or email" bind:value={draftSearch} />
		</div>
		<div>
			<label
				class="mb-1.5 block text-xs tracking-[0.12em] text-muted-foreground uppercase"
				for="status"
			>
				Status
			</label>
			<select
				id="status"
				class="border-input bg-background h-9 rounded-md border px-3 text-sm"
				value={status}
				onchange={(event) =>
					changeStatus((event.currentTarget as HTMLSelectElement).value as typeof status)}
			>
				<option value="all">All</option>
				{#each statuses as item}
					<option value={item}>{item}</option>
				{/each}
			</select>
		</div>
		<Button class="rounded-full" type="submit">Filter</Button>
	</form>

	{#if error}
		<p class="mt-6 text-sm text-destructive">{error}</p>
	{/if}

	{#if loading}
		<AdminTableSkeleton rows={6} cols={5} />
	{:else if orders.length === 0}
		<p class="mt-8 text-sm text-muted-foreground">No orders match these filters.</p>
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
									{#each statuses as item}
										<Button
											size="sm"
											variant={order.status === item ? 'default' : 'outline'}
											class="rounded-full capitalize"
											disabled={busyId === order.id || order.status === item}
											onclick={() => updateStatus(order, item)}
										>
											{item}
										</Button>
									{/each}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<ListPagination
			{total}
			limit={PAGE_SIZE}
			{offset}
			onPage={(next) => {
				offset = next;
				void load();
			}}
		/>
	{/if}
</section>
