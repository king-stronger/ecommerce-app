import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		public: true,
		static: true,
		description: 'Ecommerce API origin',
		schema: (value) => {
			if (!value) return 'http://localhost:8787';
			try {
				return new URL(value).origin;
			} catch {
				throw new Error('API_URL must be an absolute URL');
			}
		}
	}
});
