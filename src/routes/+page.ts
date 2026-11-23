import { categoriesQuery, productsQuery } from '#lib/api/catalog-queries';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { queryClient } = await parent();

	try {
		const [categories, products] = await Promise.all([
			queryClient.ensureQueryData(categoriesQuery()),
			queryClient.ensureQueryData(productsQuery({ limit: 100 }))
		]);

		return {
			categories,
			products,
			error: null as string | null
		};
	} catch {
		return {
			categories: [],
			products: [],
			error: 'The catalog is unavailable. Start the API on port 8787.'
		};
	}
};
