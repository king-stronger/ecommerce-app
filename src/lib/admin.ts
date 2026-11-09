export function slugify(value: string) {
	return value
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function eurosToCents(value: string | number) {
	const n = typeof value === 'number' ? value : Number.parseFloat(value.replace(',', '.'));
	if (!Number.isFinite(n) || n < 0) return 0;
	return Math.round(n * 100);
}

export function centsToEurosInput(cents: number | null | undefined) {
	if (cents == null) return '';
	return (cents / 100).toFixed(2);
}

export function isAdminUser(user: { role?: string | string[] | null } | null | undefined) {
	if (!user?.role) return false;
	const roles = Array.isArray(user.role) ? user.role : user.role.split(',');
	return roles.map((role) => role.trim()).includes('admin');
}

export type AdminProductImage = { url: string; alt?: string; sort?: number };

export function parseImages(images: unknown): AdminProductImage[] {
	if (!Array.isArray(images)) return [];
	const result: AdminProductImage[] = [];
	for (const [index, item] of images.entries()) {
		if (!item || typeof item !== 'object' || !('url' in item)) continue;
		const url = (item as { url?: unknown }).url;
		if (typeof url !== 'string' || !url) continue;
		const alt =
			'alt' in item && typeof (item as { alt?: unknown }).alt === 'string'
				? (item as { alt: string }).alt
				: undefined;
		result.push({ url, alt, sort: index });
	}
	return result;
}
