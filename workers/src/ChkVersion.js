import Utils from './Utils';
import Requests from './Requests';
import Store from './Store';
import TilesLoader from './TilesLoader';
import Renderer2d from './Renderer2d';
import Observer from './Observer';

let hosts = {},
	hover = {},
    zoom = -1,
	dateInterval = {},
    bbox = null,
	_ctxLabels,
	mapSize,
	pOrigin,
	pBounds,

	topLeftMerc,
    bboxBounds = null;
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}

const setBbox = (mapPos) => {
console.log('setBbox', mapPos);
	// let flag = false;
	topLeftMerc = mapPos.topLeftMerc;
	// if (!mapSize || mapSize.x !== mapPos.mapSize.x || mapSize.y !== mapPos.mapSize.y) {  
		mapSize = mapPos.mapSize;
		_ctxLabels = null;
		
	// }
	pOrigin = mapPos.pOrigin;
	pBounds = mapPos.pBounds;
	if (zoom !== mapPos.zoom || !_ctxLabels) {
		zoom = mapPos.zoom;
		bbox = mapPos.bbox;
		bboxBounds = Requests.bounds();
		bbox.forEach(arr => {
			bboxBounds.extend(arr[0], arr[1]);
			bboxBounds.extend(arr[2], arr[3]);
		});
		utils.now();
	} else {
	}
};
const getBound = () => {
	return bboxBounds;
};
const getZoom = () => zoom;

let intervalID = null,
	// delay = 10000,
    delay = 60000,
    timeoutID = null;

const utils = {
	now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
		// console.log('stop:', intervalID, delay);
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec) {
		// console.log('start:', intervalID, msec);
        if (msec) { delay = msec; }
        utils.stop();
        intervalID = setInterval(chkVersion, delay);
    },
};

const restartCheckVer = () => {
	if (!intervalID) { utils.start(); }
	utils.now();
};

const chkHost = (hostName) => {
	// console.log('chkVersion:', hostName);
	let hostLayers = Store.getHost(hostName),
		ids = hostLayers.ids,
		layersByID = hostLayers.parseLayers.layersByID,
		arr = [];

	for (let name in ids) {
		let pt = ids[name],
			layer = layersByID[name] || {},
			props = layer.properties || {},
			pars = { Name: name, Version: 'v' in pt ? pt.v : -1 };
		if (props.Temporal) {
			const dint = pt.dateInterval || layer.dateInterval || dateInterval;
// console.warn('dint:', dint);
			pars.dateBegin = dint.begin;
			pars.dateEnd = dint.end;
			if (!pars.dateBegin || !pars.dateEnd) continue;
		}
		arr.push(pars);
	}
	if (!arr.length) return;
	let url = '//' + hostName + Utils.SCRIPT;
	postMessage({ cmd: 'request', url: url });
	return Requests.getJson({
		url,
		options: hostLayers.signals ? Requests.chkSignal('chkVersion', hostLayers.signals) : {},
		paramsArr: [Requests.COMPARS, {
			layers: JSON.stringify(arr),
			bboxes: JSON.stringify(bbox || Utils.WORLDBBOX),
			// generalizedTiles: false,
			zoom: zoom
		}]
	}).then(json => {
		delete hostLayers.signals.chkVersion;
		postMessage({ cmd: 'request', remove: true, url: url });
		return json;
	})
	.catch(err => {
		postMessage({ cmd: 'request', remove: true, url: url });
		console.error(err);
		// resolve('');
	});
};
const chkVersion = () => {
	for (let host in Store.hosts) {
		// let	hostItem = hosts[host];

		let	hostItem = Store.hosts[host];
		let ids = hostItem.ids;
		if (ids) {
			let prom = chkHost(host);
			if (!prom) continue;
			prom.then(json => {
				if (json.error) {
					// console.warn('chkVersion:', json.error);
				} else {
					let res = json.res;
					if (res.Status === 'ok' && res.Result) {
						res.Result.forEach(it => {
							let id = it.name;
							if (ids[id]) {
								// postMessage({ cmd: 'request', url: id });

								let pt = ids[id],
									pl = hostItem.parseLayers.layersByID[id],

									layer = pt.layer,
									props = it.properties;
// console.warn('chkVersion:', pt, pl);
								layer.sendMessage({
									...it,
									origin: {
										dateInterval: pt.dateInterval,
										geometry: pl.geometry,
										properties: pl.properties
									},
									bboxBounds,
									mapSize,
									pOrigin,
									pBounds,
									zoom,
									topLeftMerc,
									cmd: 'version'
								}).then(res1 => {
									// console.log('___res1_____:', res1);
									// postMessage({queues: out, z: attr.z, cmdNum: attr.cmdNum}, arr);

																	// Observer.waitCheckObservers();
								});
/*
									postMessage({ cmd: 'request', remove: true, url: id });
*/
							} else {
// console.log('chkVersion layer skiped', id, it);
							}
						});
					}
				}
			});
		}
	}
};

const setDateIntervals = (pars) => {
	pars = pars || {};
	let data = pars.attr || {};
	dateInterval = pars.dt;
	// let hostName = data.hostName || Utils.HOST;
	// let host = hosts[hostName];
	// let host = hosts[pars.hostName];
	// if (host && host.ids[pars.id]) {
		// host.ids[pars.id].dateBegin = pars.dateBegin;
		// host.ids[pars.id].dateEnd = pars.dateEnd;
	// }
	// utils.now();

// console.log('setDateIntervals:', pars);
};

const drawScreen = (pars) => {
	let hostName = pars.hostName || Utils.HOST;
	let hostLayers = Store.getHost(hostName),
	// let hostLayers = hosts[hostName],
		ids = hostLayers.ids[pars.id];
		
// console.log('_drawScreen__ ____:', ids);
	if (ids && ids.layer) {
		utils.now();
		return ids.layer.sendMessage({
			...pars,
			zoom,
			topLeftMerc
		}).then(res1 => {
			// let out = {...pars};
			if (res1.bitmap) postMessage({...pars, bitmap: res1.bitmap}, [res1.bitmap]);
			else postMessage({...pars});
		});
	}

// console.log('drawScreen:', ids, pars);
};

export default {
	drawScreen,
	restartCheckVer,
	now: utils.now,
	stop: utils.stop,
	zoom,
	setBbox,
	getBound,
	getZoom,
	setDateIntervals,
};