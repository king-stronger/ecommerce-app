import { API_URL } from '$app/env/public';
import type { CreateClientConfig } from './client/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: API_URL,
	credentials: 'include'
});
