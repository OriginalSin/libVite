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
    bboxBounds = null;
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}

const setBbox = (mapPos) => {
	// let flag = false;
	if (!mapSize || mapSize.x !== mapPos.mapSize.x || mapSize.y !== mapPos.mapSize.y) {  
		mapSize = mapPos.mapSize;
		_ctxLabels = null;
		
	}
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
	// let hostLayers = hosts[hostName],
		ids = hostLayers.ids,
		layersByID = hostLayers.parseLayers.layersByID,
		arr = [];

	for (let name in ids) {
		let pt = ids[name],
			layer = layersByID[name] || {},
			props = layer.properties || {},
			pars = { Name: name, Version: 'v' in pt ? pt.v : -1 };
		if (props.Temporal) {
			// props.DateBeginUTC
			const dint = layer.dateInterval || dateInterval;
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
								postMessage({ cmd: 'request', url: id });

								let pt = ids[id],
									props = it.properties;
								if (props) {
									pt.v = props.LayerVersion;
									pt.properties = props;
									pt.geometry = it.geometry;
									if (!pt.tileAttributeIndexes) {
										Utils.idsFill(pt);
										// Requests.extend(pt, Utils.getTileAttributes(props));
										// let tmp = Utils.getTileAttributes(props);
										// pt.tileAttributeIndexes = tmp.tileAttributeIndexes;
										// pt.tileAttributeTypes = tmp.tileAttributeTypes;
									}
								}
	// console.log('chkVersion1:', pt);
								pt.id = id;
								pt.pProps = hostItem.parseLayers.layersByID[id];
								pt.hostName = host;
								pt.tiles = it.tiles;
								pt.tilesOrder = it.tilesOrder;
								pt.isGeneralized = pt.isGeneralized || {};
								TilesLoader.load(pt);
								// Promise.all(Object.values(pt.tilesPromise)).then(Observer.waitCheckObservers);
								Promise.all(Object.values(pt.tilesPromise)).then(() => {
	// console.log('chkVersion1:', pt.tilesPromise);
									Observer.waitCheckObservers();
									// utils.now();

									postMessage({ cmd: 'request', remove: true, url: id });
								});
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
	dateInterval = data.dt;
	// let hostName = data.hostName || Utils.HOST;
	// let host = hosts[hostName];
	// let host = hosts[pars.hostName];
	// if (host && host.ids[pars.id]) {
		// host.ids[pars.id].dateBegin = pars.dateBegin;
		// host.ids[pars.id].dateEnd = pars.dateEnd;
	// }
	// utils.now();

console.log('setDateIntervals:', pars);
};

export default {
	restartCheckVer,
	now: utils.now,
	stop: utils.stop,
	zoom,
	setBbox,
	getBound,
	getZoom,
	setDateIntervals,
};