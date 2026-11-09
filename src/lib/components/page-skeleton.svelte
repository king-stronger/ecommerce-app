<script lang="ts">
	let { variant = 'page' }: { variant?: 'page' | 'product' | 'bag' } = $props();
</script>

{#if variant === 'product'}
	<div class="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2" aria-hidden="true">
		<div class="grid gap-3">
			<div class="h-3 w-40 animate-pulse rounded bg-muted"></div>
			<div class="aspect-square animate-pulse rounded-2xl bg-muted"></div>
			<div class="grid grid-cols-4 gap-3">
				{#each [1, 2, 3, 4] as item (item)}
					<div class="aspect-square animate-pulse rounded-xl bg-muted"></div>
				{/each}
			</div>
		</div>
		<div class="grid content-start gap-4 lg:pt-8">
			<div class="h-10 w-2/3 animate-pulse rounded bg-muted"></div>
			<div class="h-4 w-full max-w-md animate-pulse rounded bg-muted"></div>
			<div class="h-4 w-3/4 max-w-sm animate-pulse rounded bg-muted"></div>
			<div class="my-2 h-px bg-border"></div>
			<div class="h-8 w-28 animate-pulse rounded bg-muted"></div>
			<div class="mt-4 h-12 w-full animate-pulse rounded-full bg-muted"></div>
			<div class="h-12 w-full animate-pulse rounded-full bg-muted"></div>
		</div>
	</div>
{:else if variant === 'bag'}
	<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6" aria-hidden="true">
		<div class="h-9 w-40 animate-pulse rounded bg-muted"></div>
		<ul class="mt-8 grid gap-4">
			{#each [1, 2, 3] as item (item)}
				<li class="flex gap-4 rounded-2xl border border-border p-3">
					<div class="size-24 shrink-0 animate-pulse rounded-xl bg-muted"></div>
					<div class="grid flex-1 content-center gap-2">
						<div class="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
						<div class="h-3 w-1/3 animate-pulse rounded bg-muted"></div>
						<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-hidden="true">
		<div class="mb-8 h-64 animate-pulse rounded-3xl bg-muted sm:h-80"></div>
		<div class="mb-6 h-8 w-48 animate-pulse rounded bg-muted"></div>
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as item (item)}
				<div class="grid gap-3">
					<div class="aspect-3/4 animate-pulse rounded-2xl bg-muted"></div>
					<div class="h-3 w-3/4 animate-pulse rounded bg-muted"></div>
					<div class="h-3 w-1/3 animate-pulse rounded bg-muted"></div>
				</div>
			{/each}
		</div>
	</div>
{/if}
