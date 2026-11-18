import { API_URL } from '$app/env/public';
import type { CreateClientConfig } from './client/client.gen';

/**
 * On Cloudflare, a Worker cannot fetch another Worker on workers.dev over the public
 * URL (error 1042). During SSR we go through the `API` service binding instead.
 * In the browser, and in local dev where the binding is absent, plain fetch is used.
 */
const serverFetch: typeof fetch = async (input, init) => {
	try {
		const { env } = await import('cloudflare:workers');
		const api = (env as { API?: { fetch: typeof fetch } }).API;
		if (api) {
			return await api.fetch(input, init);
		}
	} catch {
		// Not running inside the Workers runtime.
	}
	return fetch(input, init);
};

export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: API_URL,
	credentials: 'include',
	...(import.meta.env.SSR ? { fetch: serverFetch } : {})
});
