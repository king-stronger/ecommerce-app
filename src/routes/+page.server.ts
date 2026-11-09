import { getCategories, getProducts } from '#lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [categories, products] = await Promise.all([
		getCategories(),
		getProducts({ query: { limit: 100 } })
	]);

	if (categories.error || products.error || !categories.data || !products.data) {
		return {
			categories: [],
			products: [],
			categoryCounts: {} as Record<string, number>,
			error: 'The catalog is unavailable. Start the API on port 8787.'
		};
	}

	const countEntries = await Promise.all(
		categories.data.map(async (category) => {
			const result = await getProducts({
				query: { categorySlug: category.slug, limit: 100 }
			});
			return [category.slug, result.data?.length ?? 0] as const;
		})
	);

	return {
		categories: categories.data,
		products: products.data,
		categoryCounts: Object.fromEntries(countEntries) as Record<string, number>,
		error: null
	};
};
