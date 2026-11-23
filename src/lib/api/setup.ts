import { client } from '#lib/api/client/client.gen';
import { applyAuthHeaders } from '#lib/api/hey-api';
import { getBrowserQueryClient } from '#lib/api/query-client';

let ready = false;

/** Register request/response interceptors once (idempotent). */
export function setupApiClient() {
	if (ready) return;
	ready = true;

	client.interceptors.request.use((request) => applyAuthHeaders(request));

	client.interceptors.response.use((response, request) => {
		if (request.method.toUpperCase() === 'GET' || !response.ok) {
			return response;
		}

		const queryClient = getBrowserQueryClient();
		if (!queryClient) return response;

		const path = new URL(request.url).pathname;
		if (path.includes('/admin/')) {
			queryClient.removeQueries({ queryKey: ['categories'] });
			queryClient.removeQueries({ queryKey: ['products'] });
			queryClient.removeQueries({ queryKey: ['product'] });
			queryClient.removeQueries({ queryKey: ['category'] });
		}

		return response;
	});
}
