import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svgBuilder } from 'vite-svg-plugin'
import {nativeSW} from 'vite-plugin-native-sw'

const proxyPrefix = 'https://maps.kosmosnimki.ru';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgBuilder({ path: './svg/', prefix: '' }),
    nativeSW({
      entries: [{
        src: resolve(__dirname, 'workers/service-worker.js'),
        dist: 'sw.js',
      }]
    }),
	svelte({
	  onwarn(warning, defaultHandler) {
		if (warning.code === 'a11y-distracting-elements') return;
		if (warning.code === 'a11y-click-events-have-key-events') return;
		// console.log('warning.code', warning.code);
		// return;

		// handle all other warnings normally
		defaultHandler(warning);
	  }
	})
  ],
  build: {
	emptyOutDir: false,
	minify: false,
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
	port: 5172,
    proxy: {
      // string shorthand
      '/TileSender.ashx': proxyPrefix + '/TileSender.ashx',
      '/Layer/CheckVersion.ashx': proxyPrefix + '/Layer/CheckVersion.ashx',
      // '/Layer': proxyPrefix + '/Layer',
      '/VectorLayer': proxyPrefix + '/VectorLayer',
	}
  }

})
