<script lang="ts">
	import { resolve } from '$app/paths';
	import { deleteAdminProductsById, getAdminProducts } from '#lib/api/client';
	import { formatPrice } from '#lib/catalog';
	import AdminTableSkeleton from '#lib/components/admin-table-skeleton.svelte';
	import ListPagination from '#lib/components/list-pagination.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { onMount } from 'svelte';

	type Product = NonNullable<
		Awaited<ReturnType<typeof getAdminProducts>>['data']
	>['items'][number];

	const PAGE_SIZE = 10;

	let products = $state<Product[]>([]);
	let total = $state(0);
	let offset = $state(0);
	let status = $state<'all' | 'draft' | 'active' | 'archived'>('all');
	let search = $state('');
	let draftSearch = $state('');
	let loading = $state(true);
	let error = $state('');
	let busyId = $state<string | null>(null);

	async function load() {
		loading = true;
		error = '';
		const result = await getAdminProducts({
			query: {
				limit: PAGE_SIZE,
				offset,
				...(status !== 'all' ? { status } : {}),
				...(search.trim() ? { q: search.trim() } : {})
			}
		});
		loading = false;
		if (result.error || !result.data) {
			error = 'Could not load products.';
			products = [];
			total = 0;
			return;
		}
		products = result.data.items;
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

	function defaultPrice(product: Product) {
		const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
		return variant ? formatPrice(variant.price) : '—';
	}

	async function remove(product: Product) {
		if (!confirm(`Delete “${product.name}”?`)) return;
		busyId = product.id;
		const result = await deleteAdminProductsById({ path: { id: product.id } });
		busyId = null;
		if (result.error) {
			error = 'Delete failed.';
			return;
		}
		await load();
	}
</script>

<svelte:head>
	<title>Products · Admin · FORMA</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-serif text-3xl tracking-tight">Products</h1>
			<p class="mt-2 text-sm text-muted-foreground">Create, edit, and archive catalog items.</p>
		</div>
		<a
			href={resolve('/admin/products/new')}
			class="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
		>
			New product
		</a>
	</div>

	<form class="mt-8 flex flex-wrap items-end gap-3" onsubmit={applyFilters}>
		<div class="min-w-48 flex-1">
			<label class="mb-1.5 block text-xs tracking-[0.12em] text-muted-foreground uppercase" for="q">
				Search
			</label>
			<Input id="q" placeholder="Name or slug" bind:value={draftSearch} />
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
				onchange={(event) => changeStatus((event.currentTarget as HTMLSelectElement).value as typeof status)}
			>
				<option value="all">All</option>
				<option value="active">Active</option>
				<option value="draft">Draft</option>
				<option value="archived">Archived</option>
			</select>
		</div>
		<Button class="rounded-full" type="submit">Filter</Button>
	</form>

	{#if error}
		<p class="mt-6 text-sm text-destructive">{error}</p>
	{/if}

	{#if loading}
		<AdminTableSkeleton rows={6} cols={5} />
	{:else if products.length === 0}
		<p class="mt-8 text-sm text-muted-foreground">No products match these filters.</p>
	{:else}
		<div class="mt-8 overflow-x-auto">
			<table class="w-full min-w-[40rem] border-collapse text-left text-sm">
				<thead>
					<tr class="border-b border-border text-xs tracking-[0.12em] text-muted-foreground uppercase">
						<th class="py-3 pr-3 font-medium">Name</th>
						<th class="py-3 pr-3 font-medium">Status</th>
						<th class="py-3 pr-3 font-medium">Variants</th>
						<th class="py-3 pr-3 font-medium">Price</th>
						<th class="py-3 font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each products as product (product.id)}
						<tr class="border-b border-border/70">
							<td class="py-3 pr-3">
								<p class="font-medium">{product.name}</p>
								<p class="text-xs text-muted-foreground">{product.slug}</p>
							</td>
							<td class="py-3 pr-3 capitalize">{product.status}</td>
							<td class="py-3 pr-3 tabular-nums">{product.variants.length}</td>
							<td class="py-3 pr-3 tabular-nums">{defaultPrice(product)}</td>
							<td class="py-3">
								<div class="flex items-center gap-1">
									<a
										href={resolve('/admin/products/[id]', { id: product.id })}
										class="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
										aria-label={`Edit ${product.name}`}
										title="Edit"
									>
										<Pencil size={16} strokeWidth={1.7} />
									</a>
									<Button
										variant="ghost"
										size="icon-sm"
										class="text-destructive hover:bg-destructive/10"
										disabled={busyId === product.id}
										aria-label={`Delete ${product.name}`}
										title="Delete"
										onclick={() => remove(product)}
									>
										<Trash2 size={16} strokeWidth={1.7} />
									</Button>
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
