import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: 'http://localhost:8787/docs',
	output: 'src/lib/api/client',
	plugins: [
		'@hey-api/typescript',
		{
			name: '@hey-api/client-fetch',
			runtimeConfigPath: './src/lib/api/hey-api.ts'
		},
		'@hey-api/sdk'
	]
});
