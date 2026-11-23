import type { CreateClientConfig } from './client/client.gen';
import { authHeaders, baseUrl, credentials } from './transport';

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
	baseUrl: baseUrl(),
	credentials: credentials(),
	...(import.meta.env.SSR ? { fetch: serverFetch } : {})
});

/** Apply transport auth headers onto an outgoing Request. */
export function applyAuthHeaders(request: Request) {
	for (const [key, value] of Object.entries(authHeaders())) {
		request.headers.set(key, value);
	}
	return request;
}
