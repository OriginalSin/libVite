/// <reference types="vite-plugin-native-sw/global" />
import {registerSW} from 'virtual:sw-plugin'
import mapInit from './map.js';
// import SharedWorker from './sworker?worker';
import Worker from './workers/worker?worker';
// import SharedWorker from 'shared-worker:./workers/sworker/sworker.js';
// import SWorker from './sworker/sworker?sharedworker'


// const sharedWorker = new Worker1();
// sharedWorker.port.postMessage('Hello World!');

// const sworker = new SharedWorker(new URL('./sworker/sworker.js', import.meta.url), {
  // type: 'module',
// });
// const sworker = new SWorker();
// sworker.onerror = (event) => {
  // console.error("There is an error with your worker!", event);
// };
// sworker.port.start();
  // sworker.port.postMessage(['gggg']);

const worker = new Worker();
let cmdNum = 0;
worker._cmdResolver = {};
worker.onmessage = function(e) {
	const res = e.data || {};
	const from = res.from || {};
	const num = from.cmdNum || res.cmdNum;
	const resolver = worker._cmdResolver[num];
	if (resolver) {
		resolver(res);
		delete worker._cmdResolver[num];
	}
	// else console.warn('worker skip:', res.cmdNum, num, res.cmd);
	// console.log('vwworker received from worker', e.data);
}
worker._sendCmd = (attr) => {
	cmdNum++;
	return new Promise(resolve => {
		worker._cmdResolver[cmdNum] = resolve;
		worker.postMessage({...attr, cmdNum});
	});
}

L.gmx = L.gmx || {};
L.gmx.vw = worker;

// const shworker = new SharedWorker('./workers/shworker.js');
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
/**/
