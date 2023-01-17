import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svgBuilder } from 'vite-svg-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgBuilder({ path: './svg/', prefix: '' }),
		svelte({
		  onwarn(warning, defaultHandler) {
			// don't warn on <marquee> elements, cos they're cool
			if (warning.code === 'a11y-distracting-elements') return;
			if (warning.code === 'a11y-click-events-have-key-events') return;
			console.log('warning.code', warning.code);
			return;

			// handle all other warnings normally
			// defaultHandler(warning);
		  }
		})
	// svelte()
  ],
  build: {
	emptyOutDir: false,
	minify: true,
	sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
	  entry: resolve(__dirname, 'viewer/index.js'),
	  name: 'viewer',
	  // the proper extensions will be added
	  fileName: 'viewer',
	},
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['L'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          leaflet: 'L',
        },
      },
    },
  }

})
