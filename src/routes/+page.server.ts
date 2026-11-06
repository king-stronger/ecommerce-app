import { getCategories, getProducts } from '#lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = await getCategories();

	if (categories.error || !categories.data) {
		return {
			shelves: [],
			error: 'Le catalogue est indisponible. Lance l’API sur le port 8787.'
		};
	}

	const shelves = await Promise.all(
		categories.data.map(async (category) => {
			const products = await getProducts({
				query: { categorySlug: category.slug, limit: 4 }
			});
			return {
				category,
				products: products.data ?? []
			};
		})
	);

	return { shelves, error: null };
};
