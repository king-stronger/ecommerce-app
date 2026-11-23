import { categoriesQuery } from '#lib/api/catalog-queries';
import { createLoadQueryClient } from '#lib/api/query-client';
import { setupApiClient } from '#lib/api/setup';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	setupApiClient();
	const queryClient = createLoadQueryClient();
	const categories = await queryClient.ensureQueryData(categoriesQuery());
	return { queryClient, categories };
};
