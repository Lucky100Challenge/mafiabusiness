import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['devalue']
	},
	server: {
		fs: {
			strict: false
		}
	},
	ssr: {
		noExternal: ['@sveltejs/kit'],
	},
});
