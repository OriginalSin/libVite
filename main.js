/// <reference types="vite-plugin-native-sw/global" />
import {registerSW} from 'virtual:sw-plugin'
import mapInit from './map.js';
import Worker from './workers/worker?worker'

const worker = new Worker()
// const shworker = new SharedWorker('./workers/shworker.js');

L.gmx = L.gmx || {};
L.gmx.vw = worker;
// L.gmx.shw = shworker;
let dataWorker;
registerSW('sw.js').then(ev => {
	dataWorker = ev.active;
	L.gmx.sw = dataWorker;
	dataWorker.onerror = function(ev1) {
		console.warn('Error: ', ev1);
	};
	mapInit();
	// viewerInit();

})
.catch(console.error)
