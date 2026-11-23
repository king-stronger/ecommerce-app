import { queryOptions } from '@tanstack/svelte-query';
import {
	getCategories,
	getCategoriesBySlug,
	getProducts,
	getProductsBySlug
} from '#lib/api/client';

export function categoriesQuery() {
	return queryOptions({
		queryKey: ['categories'] as const,
		queryFn: async () => {
			const result = await getCategories();
			if (result.error || !result.data) {
				throw new Error('Categories unavailable');
			}
			return result.data;
		}
	});
}

export function productsQuery(
	filters: { categorySlug?: string; limit?: number; offset?: number } = {}
) {
	return queryOptions({
		queryKey: ['products', filters] as const,
		queryFn: async () => {
			const result = await getProducts({ query: filters });
			if (result.error || !result.data) {
				throw new Error('Products unavailable');
			}
			return result.data;
		}
	});
}

export function productQuery(slug: string) {
	return queryOptions({
		queryKey: ['product', slug] as const,
		queryFn: async () => {
			const result = await getProductsBySlug({ path: { slug } });
			if (result.response?.status === 404 || result.error || !result.data) {
				const error = new Error('Product not found') as Error & { status?: number };
				error.status = 404;
				throw error;
			}
			return result.data;
		}
	});
}

export function categoryQuery(slug: string) {
	return queryOptions({
		queryKey: ['category', slug] as const,
		queryFn: async () => {
			const result = await getCategoriesBySlug({ path: { slug } });
			if (result.response?.status === 404 || result.error || !result.data) {
				const error = new Error('Category not found') as Error & { status?: number };
				error.status = 404;
				throw error;
			}
			return result.data;
		}
	});
}
