/// <reference types="vite-plugin-native-sw/global" />
import {registerSW} from 'virtual:sw-plugin'
import mapInit from './map.js';
// import viewerInit from './viewer/index.js';
import Worker from './workers/worker?worker'

L.gmx = L.gmx || {};
// const mapId = 'FEZ2G';
// const commonOptions =
	// {
    // "srs": 3857,
    // "skipTiles": "All",
    // "hostName": "maps.kosmosnimki.ru",
    // "setZIndex": true,
    // "isGeneralized": true,
    // "MapName": mapId,
    // "ftc": "osm"
// };

const worker = new Worker()
L.gmx.vw = worker;
let cmdNum = 0;
worker._cmdResolver = {};
worker.onmessage = function(e) {
	const res = e.data;
	if (!res) {
		console.log('worker skip', e);
		return;
	}
	const from = res.from || res;
	const cmd = from.cmd;
	const attr = from.attr || res;
	const num = attr.cmdNum;
	switch(cmd) {
		case 'getMap':
			worker._cmdResolver[num](res.Result);
			break;
		case 'getTile':
			worker._cmdResolver[num](res);
			break;
		case 'request':
			L.gmx.Requests(res);
			break;
		default:
			worker._cmdResolver[num](res);
	}
	delete worker._cmdResolver[num];
	// console.log('vwworker received from worker', e.data);
/*
	if (res.Status === 'ok') {
		worker._cmdResolver[num](res.Result);
		// L.gmxMap = new L.gmx.gmxMap(res.Result, commonOptions);
		// L.gmxMap.leafletMap = L.gmx.map;

		// viewerInit(L.gmx.map);
		// map.addLayer(tLayer);

		// console.log('loadedMap', L.gmxMap);
	} else if (res.Status === 'error') {
		const errorInfo = res.ErrorInfo || {};
		console.warn(errorInfo.ErrorMessage, res.from);
	} else if (Array.isArray(res)) {
		res.forEach(it => {
			const zKey = it.zKey;
			
			if (tLayer.__promises[zKey]) tLayer.__promises[zKey](it);
			// if (this.__promises[zKey]) this.__promises[zKey].resolve(it.bitmap);
		});
	// } else if (res[0].bitmap) {
		// drawBitMap(res[0].bitmap);
	}
*/
}
worker._sendCmd = (cmd, pars) => {
	cmdNum++;
	return new Promise((resolve) => {
		worker._cmdResolver[cmdNum] = resolve;
		const attr = {cmd, cmdNum, ...pars};
		switch(cmd) {
			case 'getMap':
				worker.postMessage({cmd: 'getMap', attr});
				// worker.postMessage({cmd: 'getMap', {cmdNum, ...attr}}).then(res => {
					// console.log('getMap res', res);
				// });
				break;
			case 'getTile':
				worker.postMessage({cmd: 'getTile', attr});
				break;
			case 'mousemove':
				worker.postMessage({cmd: 'mousemove', attr});
				break;
			default:
				worker.postMessage({cmd, attr});
			// case 'layerremove':
				// worker.postMessage({cmd: 'layerremove', attr});
				// break;
			// case 'layeradd':
				// worker.postMessage({cmd: 'layeradd', attr});
				// break;
		}
	});
}

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
