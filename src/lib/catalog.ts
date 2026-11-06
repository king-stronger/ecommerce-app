import type { GetProductsResponses } from '#lib/api/client';

export type CatalogProduct = GetProductsResponses[200][number];

const money = new Intl.NumberFormat('fr-FR', {
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

export function productImage(product: CatalogProduct) {
	if (!Array.isArray(product.images)) return null;
	const first = product.images[0];
	if (first && typeof first === 'object' && 'url' in first && typeof first.url === 'string') {
		return first.url;
	}
	return null;
}
