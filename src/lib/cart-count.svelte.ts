let count = $state<number | null>(null);

export function getCartCount() {
	return count;
}

export function setCartCount(next: number) {
	count = next;
}
