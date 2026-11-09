import { getCategoriesBySlug, getProducts } from '#lib/api/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [category, products] = await Promise.all([
		getCategoriesBySlug({ path: { slug: params.slug } }),
		getProducts({ query: { categorySlug: params.slug } })
	]);

	if (category.error || !category.data) {
		error(404, 'This category does not exist.');
	}

	return {
		category: category.data,
		products: products.data ?? []
	};
};
