import { getProductsBySlug } from '#lib/api/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductsBySlug({ path: { slug: params.slug } });
	if (product.error || !product.data) {
		error(404, 'This piece does not exist.');
	}
	return { product: product.data };
};
