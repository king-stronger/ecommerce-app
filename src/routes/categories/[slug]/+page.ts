import { categoryQuery, productsQuery } from '#lib/api/catalog-queries';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { queryClient } = await parent();

	try {
		const [category, products] = await Promise.all([
			queryClient.ensureQueryData(categoryQuery(params.slug)),
			queryClient.ensureQueryData(productsQuery({ categorySlug: params.slug }))
		]);
		return { category, products };
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			error(404, 'This category does not exist.');
		}
		throw err;
	}
};
