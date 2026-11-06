import { getCategories } from '#lib/api/client';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const categories = await getCategories();
	return {
		categories: categories.data ?? []
	};
};
