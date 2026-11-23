import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { authHeaders, baseUrl, credentials } from '#lib/api/transport';

export const authClient = createAuthClient({
	baseURL: baseUrl(),
	fetchOptions: {
		credentials: credentials(),
		onRequest(context) {
			for (const [key, value] of Object.entries(authHeaders())) {
				context.headers.set(key, value);
			}
			return context;
		}
	},
	plugins: [adminClient()]
});
