import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { API_URL } from '$app/env/public';

export const authClient = createAuthClient({
	baseURL: API_URL,
	fetchOptions: {
		credentials: 'include'
	},
	plugins: [adminClient()]
});
