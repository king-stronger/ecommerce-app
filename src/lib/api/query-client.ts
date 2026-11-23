import { browser } from '$app/env';
import { QueryClient } from '@tanstack/svelte-query';

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60_000,
				retry: 1
			}
		}
	});
}

let browserClient: QueryClient | undefined;

/** Singleton in the browser so catalog cache survives client navigations. */
export function getBrowserQueryClient() {
	if (!browser) return undefined;
	browserClient ??= makeQueryClient();
	return browserClient;
}

/** One client per SSR request; reuse the browser singleton on the client. */
export function createLoadQueryClient() {
	if (browser) {
		return getBrowserQueryClient()!;
	}
	return makeQueryClient();
}

export function clearQueryCache() {
	getBrowserQueryClient()?.clear();
}
