import Utils from './Utils';
import Requests from './Requests';
import Store from './Store';
import ChkVersion from './ChkVersion';
import TilesLoader from './TilesLoader';
import Renderer2d from './Renderer2d';
import Observer from './Observer';

// let hosts = {},
let	hover = {},
    // zoom = -1,
	// dateInterval = {},
    // bbox = null,
mapSize,
	_ctxLabels;
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}


const drawLabels = (pars) => {
	// let observer = pars.observer,
		// ctx = observer.ctx,
	if (mapSize && !_ctxLabels) {
		const w = mapSize.x, h = mapSize.y;
		const canvas = new OffscreenCanvas(w, h);
		canvas.width = w; canvas.height = h;
		_ctxLabels = canvas.getContext('2d');
// console.log('drawLabels _______________:', w, h);
	}
	if (pars.length) {
		let data = {};
		pars.reduce((a, c) => {
			let indexes = c.indexes;
			let t = c.tile;
			let nm = c.nm;
			
			let pProps = t.pProps;
			let itemLabel = t.itemslabels[nm];
			let bArr = t.itemsbounds[nm];
			let item = t.values[nm];
			let id = item[indexes[pProps.properties.identityField]];
			let layerID = t.LayerName;
			a[layerID] = a[layerID] || {};
			a[layerID][id] = a[layerID][id] || {bArr: []};
			a[layerID][id].bArr.push(bArr);
			a[layerID][id].itemLabel = itemLabel;
			// a[layerID][id].push({
				// itemLabel
			// });

			// let LayerName = LayerName;
			return a;
		}, data);
// console.log('drawLabels _______________:', mapSize, data, pars);
	}
}

const setHover = (obj) => {
// console.log('setHover _______________:', hover, obj);
	hover = obj;
}
const drawItem = (pars) => {
	let observer = pars.observer,
		key = observer.key,
		layerID = observer.layerID,
		z = observer.z,
		ctx = observer.ctx,
		style = pars.style || {},
		itemData = pars.itemData,
		renderStyle = style.renderStyle || {},
		indexes = pars.indexes,
		types = pars.types,
		image = pars.raster_,
		item = itemData.item,
		geo = item[item.length - 1],
		type = geo.type,
		coords = observer.pars.coords,
		tz = Math.pow(2, coords.z);
// console.log('drawItem _______________:', pars.raster_);

	let	pt = {
		mInPixel: 256 * tz / Utils.WORLDWIDTHFULL,
		_drawing: true,
		_ctx: ctx,
		_hover: hover.layerID === layerID && hover.hoverId === item[0],
		// _hover: hover.layerID === itemData.layerID && hover.hoverId === item[0],
		tpx: 256 * (coords.x % tz - tz/2),
		tpy: 256 * (tz/2 - coords.y % tz),
		indexes,
		types,
		image,
		itemData,
		tile: pars.tile,
		nm: pars.nm,
		options: renderStyle
	};
	if (pt.options.styleHooks.length) setValsByStyle(pt);
	// if (coords.z === 13 && coords.x === 4835 && coords.y === 2552) {
	// }
	// clearCache(layerID, z);
	// offScreenCache[layerID] = offScreenCache[layerID] || {};
	// offScreenCache[layerID][z] = offScreenCache[layerID][z] || {};
	if (!ctx) {
		if (offScreenCache[layerID][z][key]) {
			pt._ctx = observer.ctx = offScreenCache[layerID][z][key];
			observer.ctx.clearRect(0, 0, 256, 256);
		} else if (!observer.tile) {
			const canvas = new OffscreenCanvas(256, 256);
			canvas.width = canvas.height = 256;
			canvas._key = key;
			observer.canvas = canvas;
			pt._ctx = observer.ctx = canvas.getContext('2d');
		} else {
			offScreenCache[layerID][z][key] = pt._ctx = observer.ctx = observer.tile.getContext('2d');
		}
	}
// console.log('vvvvvvvvvv ___coords____ ', observer, hover);

	// pt._ctx.fillText(observer.key, 128, 128);
	// pt._ctx.fillText(coords.x + ':' + coords.y + ':' + coords.z, 128, 128);
	// Renderer2d.updatePoly(pt);
	Renderer2d.updatePolyMerc(pt);
}

const setValsByStyle = (pt) => {
	// labelField
	const fn = pt.options.styleHooks[0];
	// const res = fn.call(this, pt.options, pt.itemData.item, pt.indexes, Utils);
	const res = fn.call(this, pt, Utils);
// console.log('setValsByStyle ',res, pt);
}

const getTile = (pars) => {
	let message = pars.attr;
	// setBbox(message.mapPos);
	// if (setBbox(message.mapPos)) 
	let hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		cmdNum = message.cmdNum,
		z = message.z,
		hostItem = Store.getHost(hostName);
		// hostLayers = Store.hosts[hostName];
// Store.getHost(hostName)
	if (hostItem && hostItem.ids && hostItem.ids[layerID]) {
		let observers = hostItem.ids[layerID].observers;
		for (let key in observers) {
			if (observers[key].pars.z !== z) {
				observers[key].resolver(null);
				delete observers[key];
			}
		}
	}
	// const parseLayers = hostLayers && hostLayers.parseLayers && hostLayers.parseLayers.layersByID[layerID];
	// if (parseLayers && parseLayers.layersByID[layerID]) {
		// const layer = parseLayers.layersByID[layerID];
		// if (hostLayers && hostLayers.parseLayers && hostLayers.parseLayers[layerID]) {
				// hostLayers.parseLayers.isVisible.forEach(it => {addSource(it)});
		// }
	// }
// console.log('vvvvvvvvvv ___res____ ', message);
	return Promise.all(queue.map(coords => 
		Observer.add({ type: 'screen', coords, zKey: coords.x + ':' + coords.y + ':' + coords.z + '_' + cmdNum , ...message})
	));
};
const offScreenCache = {};
const clearCache = (layerID, z) => {
// console.log('setHover _______________:', hover, obj);
	if (z === undefined) delete offScreenCache[layerID];
	else if (offScreenCache[layerID]) {
		Object.keys(offScreenCache[layerID]).forEach(kz => {
			if (z != kz) delete offScreenCache[layerID][z];
		});
	}
}

const getTiles = (pars) => {
	let message = pars.attr;
	let hostName = message.hostName || Utils.HOST,
		layerID = message.layerID,
		// queue = message.queue,
		queues = message.queues,
		// cmdNum = message.cmdNum,
		z = message.z,
		hostItem = Store.getHost(hostName);
		// hostLayers = hosts[hostName];
// Store.getHost(hostName)

	if (hostItem && hostItem.ids && hostItem.ids[layerID]) {
		let observers = hostItem.ids[layerID].observers;
		for (let key in observers) {
			if (observers[key].pars.z !== z) {
				observers[key].resolver(null);
				delete observers[key];
			}
		}
	}
	hostItem.parseLayers.layersByID[layerID].zIndex = message.zIndex;
	delete message.queues;
	clearCache(layerID, z);
	offScreenCache[layerID] = offScreenCache[layerID] || {};
	offScreenCache[layerID][z] = offScreenCache[layerID][z] || {};

	const arrPromise = queues.map(it => Observer.add({ ...message, ...it, type: 'screen',  queue: it}));
	if (message.flagLoad) ChkVersion.now();
	else Observer.waitCheckObservers(5);
	return Promise.all(arrPromise);
};

const sortLayersData = (data) => {
	let hostName = Utils.HOST,
		hostItem = Store.getHost(hostName),
		// hostLayers = hosts[hostName],
		layersByID = hostItem.parseLayers.layersByID;
	return data.items.sort((a, b) => {
		let aid = a.layerID, bid = b.layerID;
// console.log('sortLayersData', a, b);
		let zl = layersByID[bid].zIndex - layersByID[aid].zIndex;
		return zl ? zl : a.items[0] - b.items[0];
	});
};

export default {
	sortLayersData,
	setHover,
	getTile,
	getTiles,
	drawItem,
	drawLabels
};