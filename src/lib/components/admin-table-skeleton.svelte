<script lang="ts">
	let {
		rows = 6,
		cols = 5
	}: {
		rows?: number;
		cols?: number;
	} = $props();
</script>

<div class="mt-8 overflow-hidden rounded-2xl border border-border" aria-hidden="true">
	<div class="grid gap-0">
		<div
			class="grid border-b border-border bg-muted/40 px-4 py-3"
			style={`grid-template-columns: repeat(${cols}, minmax(0, 1fr));`}
		>
			{#each Array.from({ length: cols }, (_, i) => i) as col (col)}
				<div class="h-3 w-16 animate-pulse rounded bg-muted"></div>
			{/each}
		</div>
		{#each Array.from({ length: rows }, (_, i) => i) as row (row)}
			<div
				class="grid items-center gap-3 border-b border-border/70 px-4 py-4 last:border-b-0"
				style={`grid-template-columns: repeat(${cols}, minmax(0, 1fr));`}
			>
				{#each Array.from({ length: cols }, (_, i) => i) as col (col)}
					<div
						class="h-3 animate-pulse rounded bg-muted"
						style={`width: ${col === 0 ? '70%' : '40%'}`}
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>
