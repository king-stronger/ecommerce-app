import { API_URL } from '$app/env/public';

export type AuthMode = 'cookie' | 'bearer';

let authMode: AuthMode = 'cookie';
let bearerToken: string | null = null;

/** Default stays cookie for the web storefront; switch to bearer for a future Capacitor app. */
export function setAuthMode(mode: AuthMode) {
	authMode = mode;
}

export function setBearerToken(token: string | null) {
	bearerToken = token;
}

export function baseUrl() {
	return API_URL;
}

export function credentials(): RequestCredentials {
	return authMode === 'cookie' ? 'include' : 'omit';
}

export function authHeaders(): Record<string, string> {
	if (authMode === 'bearer' && bearerToken) {
		return { Authorization: `Bearer ${bearerToken}` };
	}
	return {};
}

export async function apiFetch(path: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	for (const [key, value] of Object.entries(authHeaders())) {
		headers.set(key, value);
	}
	const url = path.startsWith('http')
		? path
		: `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
	return fetch(url, {
		...init,
		headers,
		credentials: credentials()
	});
}
