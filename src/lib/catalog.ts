import type { GetProductsResponses } from '#lib/api/client';

export type CatalogProduct = GetProductsResponses[200][number];

const money = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR'
});

export function formatPrice(cents: number) {
	return money.format(cents / 100);
}

export function productPrice(product: CatalogProduct) {
	const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
	return variant ? formatPrice(variant.price) : '';
}

export function productImages(product: {
	images:
		| string
		| number
		| boolean
		| unknown
		| { [key: string]: unknown }
		| Array<unknown>;
}) {
	if (!Array.isArray(product.images)) return [] as string[];
	return product.images
		.map((item) => {
			if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
				return item.url;
			}
			return null;
		})
		.filter((url): url is string => !!url);
}

export function productImage(product: CatalogProduct) {
	return productImages(product)[0] ?? null;
}
