import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svgBuilder } from 'vite-svg-plugin'
import {nativeSW} from 'vite-plugin-native-sw'
// import SharedWorker from 'vite-plugin-sharedworker'
// import webWorkerLoader from 'rollup-plugin-web-worker-loader';

const proxyPrefix = 'https://maps.kosmosnimki.ru';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgBuilder({ path: './svg/', prefix: '' }),
			// webWorkerLoader({
				// 'shared-worker': './SharedWorkers/sworker.js'
			// }),
	// SharedWorker(),
	// SharedWorker(
// {
      // entries: [{
        // src: resolve(__dirname, 'sworker/sworker.js'),
        // dist: 'shworker.js',
      // }]
    // }	),

    nativeSW({
      entries: [{
        src: resolve(__dirname, 'workers/service-worker.js'),
        dist: 'sw.js',
      }]
    }),
	svelte({
	  onwarn(warning, defaultHandler) {
		if (warning.code === 'a11y-autofocus') return;
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
		// plugins: [
			// webWorkerLoader(/* configuration */),
		// ],
    },
  },
  server: {
	// host: '127.0.0.1',
	// port: 8080,
	// https: true,
	port: 5172,
    proxy: {
		// changeOrigin: true,
      // string shorthand
      '/TileSender.ashx': proxyPrefix + '/TileSender.ashx',
      // '/Layer/CheckVersion.ashx': proxyPrefix + '/Layer/CheckVersion.ashx',
      // '^/Layer/': {
                // target: proxyPrefix + '/Layer/',
                // changeOrigin: true,
            // },
      '/VectorLayer': proxyPrefix + '/VectorLayer',
	}
  }

})
