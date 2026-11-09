<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';

	let {
		total,
		limit,
		offset,
		onPage
	}: {
		total: number;
		limit: number;
		offset: number;
		onPage: (nextOffset: number) => void;
	} = $props();

	const page = $derived(Math.floor(offset / limit) + 1);
	const pageCount = $derived(Math.max(1, Math.ceil(total / limit)));
	const from = $derived(total === 0 ? 0 : offset + 1);
	const to = $derived(Math.min(offset + limit, total));
	const canPrev = $derived(offset > 0);
	const canNext = $derived(offset + limit < total);
</script>

{#if total > 0}
	<div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
		<p class="text-muted-foreground">
			{from}–{to} of {total}
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class="rounded-full"
				disabled={!canPrev}
				onclick={() => onPage(Math.max(0, offset - limit))}
			>
				Previous
			</Button>
			<span class="tabular-nums text-muted-foreground">Page {page} / {pageCount}</span>
			<Button
				variant="outline"
				size="sm"
				class="rounded-full"
				disabled={!canNext}
				onclick={() => onPage(offset + limit)}
			>
				Next
			</Button>
		</div>
	</div>
{/if}
