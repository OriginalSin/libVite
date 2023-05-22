import Utils from './Utils';
import Requests from './Requests';
import Store from './Store';
import ChkVersion from './ChkVersion';
import Observer from './Observer';
import Ids from './Ids';

// import LayerWorker from '/LayerWorkers/lworker?worker'

const optDef = {
	...Requests.COMPARS,
	ModeKey: 'map',
	skipTiles: 'All',
	sw: 1,
	MapName: 'DefaultMap'
};	

const getMap = (pars) => {
	pars = pars || {};
	
	const hostName = pars.hostName || Utils.HOST;

	if (pars.mapId) { pars.MapName = pars.mapId; }
	let attr = {...optDef, ...pars, sw: 0};
	// let attr = {...optDef, ...pars.attr, sw: 0};
console.log('getMap', pars);
	const url = '//' + hostName + '/TileSender.ashx?' + Requests.getFormBody(attr) + '&' + Date.now();
	return fetch(url)
	.then(res => {
		const cType = res.headers.get('Content-Type'); // application/json; charset=utf-8 либо  text/javascript; charset=utf-8
		return cType.indexOf('application/json') > -1 || cType.indexOf('text/javascript') > -1 ? res.json() : {};
	})
	.then(res => {
		if (res.Status === 'ok' && res.Result) {
			const parsed = parseMapTree(res.Result, hostName)
			const host = Store.getHost(hostName);
			Store.setHost({ ids: {}, signals: {}, ...host, ...parsed }, hostName);
			// hosts[hostName] = { ids: {}, signals: {}, ...hosts[hostName], ...parsed };
			// parsed.parseLayers.isVisible.forEach(it => {addSource(it)});
			res = res.Result;
		}
		return {from: pars, ...res};
	})
};
const parseMapTree = (mapInfo, hostName) => {
	// const host = hosts[hostName] || {ids: {}, signals: {}};
	const props = mapInfo.properties;
	const outInfo = { children: mapInfo.children, properties: props };
	const lHash = {};
	const lArr = [];
	const isVisible = [];
	let zIndex = 0;
	let needStart = false;
	const fun = (it, i) => {
		if (it.type === 'layer') {
			let c = {...it.content};
			let prp = c.properties;
			zIndex++;
			c = {...c, ...Utils.parseStyles(prp), zIndex};
			const LayerID = prp.LayerID;
			if (prp.type === 'Vector') {
				if (prp.visible) {
					needStart = true;
					isVisible.push({id: LayerID, hostName, c});
				}
			}
			lArr.push(c);
			lHash[LayerID] = c;
		} else if (it.type === 'group') {
		}
		// console.log('11 iterateNode',host, it);
	};
	_parseNode(outInfo, fun, true);
	return {
		layerTree: mapInfo,
		parseLayers: {
			layers: lArr,
			layersByID: lHash,
			isVisible
		},
		needStart
	};
};
const _parseNode = (treeInfo, callback, onceFlag) => {
	const iterate = (node) => {
		const arr = node.children || [];
		for (let i = 0, len = arr.length; i < len; i++) {
			const layer = arr[i];

			if (callback(layer, node) && onceFlag) { break; }
			if (layer.type === 'group') {
				iterate(layer.content);
			}
		}
	};

	treeInfo && iterate(treeInfo);
};

const addSource = (pars) => {
	pars = pars || {};

	let attr = pars.attr || {};
	let id = pars.id || attr.id;
	
	if ('zoom' in pars) { zoom = pars.zoom; }
	if ('bbox' in pars) { bbox = pars.bbox; }
		
	let hostName = pars.hostName || Utils.HOST;
	let hostItem = Store.getHost(hostName);
	// let hostItem = hosts[hostName];
console.log('addSource ', hostItem);
					
// const lWorker = new LayerWorker();
// hostItem.worker = lWorker;
// lWorker.postMessage({
	// id: pars.id
	// geometry: pars.c.geometry,
	// properties: pars.c.properties
// });

	if (id && hostItem) {
		// if (!hosts[hostName]) {
			// hosts[hostName] = {ids: {}, signals: {}};
			// if (pars.apiKey) {
				// hosts[hostName].apiKeyPromise = Requests.getJson({
					// url: '//' + hostName + '/ApiKey.ashx',
					// paramsArr: [Requests.COMPARS, {
						// Key: pars.apiKey
					// }]
				// }).then((json) => {
					// console.log('/ApiKey.ashx', json);
					// let res = json.res;
					// if (res.Status === 'ok' && res.Result) {
						// hosts[hostName].Key = res.Result.Key;
						// return hosts[hostName].Key;
					// }
				// });
			// }

		// }
		let parseLayers = hostItem.parseLayers;
		let linkAttr = parseLayers.layersByID[id];
		let props = linkAttr.properties;
		if (props.Temporal && attr.dateInterval) {
			linkAttr.dateInterval = attr.dateInterval;
		}
		if (hostItem.ids[id] && hostItem.ids[id].observers) {
			// pars.observers = hostItem.ids[id].observers;
			Observer.add(pars);

			hostItem.ids[id] = {
				...hostItem.ids[id],
				...pars
			};
		} else {
			let layer = new Ids({
				id,
				geometry: linkAttr.geometry,
				properties: linkAttr.properties
			});
			hostItem.ids[id] = {
				layer,
				...pars
			};
			// let tt = {
				// cmd: 'fgfg',
						// geometry: linkAttr.geometry,
						// properties: linkAttr.properties
			// };
			// layer.sendMessage(tt).then(res => {
// console.log('res', res);
			// });
			// layer.sendMessage(tt).then(res => {
// console.log('res1', res);
			// });
		}
		let { stylesPromise } = Utils.parseStyles(linkAttr.properties);
		linkAttr.stylesPromise = stylesPromise;
		// Requests.extend(linkAttr, Utils.parseStyles(linkAttr.properties));
		stylesPromise.then((res) => {
			linkAttr.styles = res;
// console.log('linkAttr ', linkAttr);
			// delete linkAttr.stylesPromise;
		// });
ChkVersion.restartCheckVer();

        // if (!intervalID) { utils.start(); }
		// utils.now();
		});
	} else {
		console.warn('Warning: Specify layer `id` and `hostName`', pars);
	}

// console.log('addSource:', pars);
	return;
};

const removeSource = (pars) => {
	pars = pars || {};

	let attr = pars.attr || {};
	let id = pars.id;
	if (id) {
		let hostName = attr.hostName || Utils.HOST;
		let hostItem = Store.getHost(hostName);
		if (hostItem) {
			let pt = hostItem.ids[id];
console.log('removeSource:', pt);
			if (pt.layer && pt.layer.worker) {
				pt.layer.worker.terminate();
			}
			// Observer.removeLayer(id);
			delete hostItem.ids[id];
			// if (Object.keys(hosts[hostName].ids).length === 0) { delete hosts[hostName]; }
			if (Object.keys(Store.hosts).length === 0) { ChkVersion.stop(); }
		}
	} else {
		console.warn('Warning: Specify layer id and hostName', pars);
	}
// console.log('removeSource:', pars);
	//Requests.removeDataSource({id: message.layerID, hostName: message.hostName}).then((json) => {
	return;
};

export default {
	getMap,
	removeSource,
	addSource
};