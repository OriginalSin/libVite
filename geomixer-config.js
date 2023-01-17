import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svgBuilder } from 'vite-svg-plugin'

const proxyPrefix = 'https://maps.kosmosnimki.ru';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgBuilder({ path: './svg/', prefix: '' }),
	svelte()
  ],
  build: {
	emptyOutDir: false,
	minify: true,
	sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
		  entry: resolve(__dirname, 'geomixer/index.js'),
		  name: 'Geomixerv',
		  // the proper extensions will be added
		  fileName: 'geomixerv',
	},
	// ,
	// {
      // entry: resolve(__dirname, 'viewer/index.js'),
      // name: 'viewer',
      // fileName: 'viewer',
    // }
	// ],
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
  },
  server: {
    proxy: {
      // string shorthand
      '/TileSender.ashx': proxyPrefix + '/TileSender.ashx',
      '/Layer/CheckVersion.ashx': proxyPrefix + '/Layer/CheckVersion.ashx',
      // '/Layer': proxyPrefix + '/Layer',
      '/VectorLayer': proxyPrefix + '/VectorLayer',
	}
  }

})
