import { productQuery } from '#lib/api/catalog-queries';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { queryClient } = await parent();

	try {
		const product = await queryClient.ensureQueryData(productQuery(params.slug));
		return { product };
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			error(404, 'This piece does not exist.');
		}
		throw err;
	}
};
