import Utils from './Utils';
import Requests from './Requests';
import TilesLoader from './TilesLoader';
import Renderer2d from './Renderer2d';
import Observer from './Observer';

let hosts = {},
    zoom = 3,
    bbox = null;
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}

const setBbox = (mapPos) => {
	if (zoom !== mapPos.zoom) {
		zoom = mapPos.zoom;
		bbox = mapPos.bbox;
		utils.now();
	} else {
	}
};

let delay = 10000,
    // delay = 60000,
	intervalID = null,
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

const chkHost = (hostName) => {
	// console.log('chkVersion:', hostName, hosts);
	let hostLayers = hosts[hostName],
		ids = hostLayers.ids,
		arr = [];

	for (let name in ids) {
		let pt = ids[name],
			pars = { Name: name, Version: 'v' in pt ? pt.v : -1 };
		if (pt.dateBegin) {
			pars.dateBegin = pt.dateBegin;
		}
		if (pt.dateEnd) {
			pars.dateEnd = pt.dateEnd;
		}
		arr.push(pars);
	}

	return Requests.getJson({
		url: '//' + hostName + Utils.SCRIPT,
		options: hostLayers.signals ? Requests.chkSignal('chkVersion', hostLayers.signals) : {},
		paramsArr: [Requests.COMPARS, {
			layers: JSON.stringify(arr),
			bboxes: JSON.stringify(bbox || Utils.WORLDBBOX),
			// generalizedTiles: false,
			zoom: zoom
		}]
	}).then(json => {
		delete hostLayers.signals.chkVersion;
		return json;
	})
	.catch(err => {
		console.error(err);
		// resolve('');
	});
};
const chkVersion = () => {
// console.log('chkVersion', hosts);
	for (let host in hosts) {
		let hostLayers = hosts[host],
			ids = hostLayers.ids;
		if (ids) {
			chkHost(host).then(json => {
				if (json.error) {
					console.warn('chkVersion:', json.error);
				} else {
					let res = json.res;
					if (res.Status === 'ok' && res.Result) {
						res.Result.forEach(it => {
							let id = it.name;
							if (ids[id]) {
								let pt = ids[id],
									props = it.properties;
								if (props) {
									pt.v = props.LayerVersion;
									pt.properties = props;
									pt.geometry = it.geometry;
									if (!pt.tileAttributeIndexes) {
										Requests.extend(pt, Utils.getTileAttributes(props));
									}
								}
								pt.id = id;
								pt.hostName = host;
								pt.tiles = it.tiles;
								pt.tilesOrder = it.tilesOrder;
								pt.isGeneralized = pt.isGeneralized || {};
								TilesLoader.load(pt);
								Promise.all(Object.values(pt.tilesPromise)).then(Observer.waitCheckObservers);
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

const addSource = (pars) => {
	pars = pars || {};

	let id = pars.id || pars.attr.id;
	
	if ('zoom' in pars) { zoom = pars.zoom; }
	if ('bbox' in pars) { bbox = pars.bbox; }
		
	let hostName = pars.hostName || Utils.HOST;
	let hostItem = hosts[hostName];
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
		if (hostItem.ids[id] && hostItem.ids[id].observers) {
			// pars.observers = hostItem.ids[id].observers;
			hostItem.ids[id] = {...hostItem.ids[id], ...pars};
		} else hostItem.ids[id] = pars;
		let parseLayers = hostItem.parseLayers;
		let linkAttr = parseLayers.layersByID[id];
		Requests.extend(linkAttr, Utils.parseStyles(linkAttr.properties));
		linkAttr.stylesPromise.then((res) => {
			linkAttr.styles = res;
			// delete linkAttr.stylesPromise;
		});

        if (!intervalID) { utils.start(); }
		utils.now();
	} else {
		console.warn('Warning: Specify layer `id` and `hostName`', pars);
	}

// console.log('addSource:', pars);
	return;
};

const removeSource = (pars) => {
	pars = pars || {};

	let id = pars.id || pars.attr.id;
	if (id) {
		let hostName = pars.hostName || Utils.HOST;
		if (hosts[hostName]) {
			let pt = hosts[hostName].ids[id];
// console.log('signals:', pt.signals, pt);
			if (pt.signals) {
				Object.values(pt.signals).forEach((it) => {
					it.abort();
				});
			}
			delete hosts[hostName].ids[id];
			// if (Object.keys(hosts[hostName].ids).length === 0) { delete hosts[hostName]; }
			if (Object.keys(hosts).length === 0) { utils.stop(); }
		}
	} else {
		console.warn('Warning: Specify layer id and hostName', pars);
	}
// console.log('removeSource:', pars);
	//Requests.removeDataSource({id: message.layerID, hostName: message.hostName}).then((json) => {
	return;
};
/*
const moveend = (pars) => {
	pars = pars || {};
// console.log('moveend:', pars);
	
	if ('zoom' in pars) { zoom = pars.zoom; }
	if ('bbox' in pars) { bbox = pars.bbox; }
		
	utils.now();
	return;
};

const drawTile = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || HOST,
		layerID = pars.layerID,
		host = hosts[hostName],
		parsedLayer = host.parseLayers.layersByID[layerID],
		ids = host.ids[layerID];
 // console.log('drawTile:', pars);

	return new Promise((resolve) => {
		parsedLayer.stylesPromise.then(st => {
			Promise.all(Object.values(ids.tilesPromise)).then((res) => {

	// console.log('drawTile tilesPromise ___:', st, res);
				resolve(Requests.extend(
					drawTest(pars), pars
				));
			});
		});
		// if (host && host.layerTree) {
			// resolve(host.layerTree);
		// } else {
			// Requests.getJson({
				// url: '//' + hostName + '/Map/GetMapFolder',
				// options: {},
				// params: {
					// srs: 3857, 
					// skipTiles: 'All',
					// mapId: pars.mapID,
					// folderId: 'root',
					// visibleItemOnly: false
				// }
			// }).then(json => {
				// if (!hosts[hostName]) { hosts[hostName] = {ids: {}, signals: {}}; }
 // console.log('getMapTree:', hosts, json);
				// resolve(json);
				// hosts[hostName].layerTree = json.res.Result;
				// hosts[hostName].parseLayers = parseTree(json.res);
			// })
		// }
	});
};

*/
/*
const chkTiles = (opt) => {
	let	arr = [],
		tcnt = 0,
		pars = opt.observer.pars,
		// dateInterval = pars.dateInterval,
		obbox = pars.bbox;
	for (let i = 0, len = opt.tiles.length; i < len; i++) {
		let tile = opt.tiles[i],
			bbox = tile.bbox;
		if (bbox[0] > obbox.max.x || bbox[2] < obbox.min.x || bbox[1] > obbox.max.y || bbox[3] < obbox.min.y) {continue;}
		tcnt++;
	}
console.log('chkTiles _1______________:', tcnt, pars.zKey, opt); //, tile.z, tile.x, tile.y, tile.span, tile.level);
	return arr;

};
const getStyleNum = (arr, styles, indexes, z) => {
	// let out = -1;
	return 0;
};
*/

/*
const iterateLayers = (treeInfo, callback) => {
	var iterate = function(arr) {
		for (var i = 0, len = arr.length; i < len; i++) {
			var layer = arr[i];

			if (layer.type === 'layer') {
				callback(layer.content);
			} else if (layer.type === 'group') {
				iterate(layer.content.children || []);
			}
		}
	};

	treeInfo && iterate(treeInfo.children);
};

const getTiles = (message) => {
	let hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		z = message.z,
		hostLayers = hosts[hostName];

	if (hostLayers && hostLayers.ids && hostLayers.ids[layerID]) {
		let observers = hostLayers.ids[layerID].observers;
		for (let key in observers) {
			if (observers[key].pars.z !== z) {
				observers[key].resolver(null);
				delete observers[key];
			}
		}
	}
// console.log('vvvvvvvvvv ___res____ ', message);
	return Promise.all(queue.map(coords => 
		addObserver(Requests.extend({
			coords: coords,
			zKey: coords.x + ':' + coords.y + ':' + coords.z
		}, message))
	));
};

const getMapTree = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || HOST,
		host = hosts[hostName];

	return new Promise((resolve) => {
		if (host && host.layerTree) {
			resolve(host.layerTree);
		} else {
			let apiKeyPromise = !host || !host.apiKeyPromise ? Requests.getJson({
					url: '//' + hostName + '/ApiKey.ashx',
					paramsArr: [{
						Key: pars.apiKey
					}]
				}) : host.apiKeyPromise;

			// if (!host || !host.apiKeyPromise) {
				// host.apiKeyPromise = Requests.getJson({
					// url: '//' + hostName + '/ApiKey.ashx',
					// paramsArr: [{
						// Key: pars.apiKey
					// }]
				// });
				
			// }
			apiKeyPromise.then(json => {
				// console.log('/ApiKey.ashx', json);
				let res = json.res;
				if (res.Status === 'ok' && res.Result) {
					return res.Result.Key;
				}
				return null;
			})
			.then(apiKey => {
				Requests.getJson({
					url: '//' + hostName + '/Map/GetMapFolder',
					// options: {},
					params: {
						apiKey: apiKey,
						srs: 3857, 
						skipTiles: 'All',
						mapId: pars.mapID,
						folderId: 'root',
						visibleItemOnly: false
					}
				}).then(json => {
					if (!hosts[hostName]) { hosts[hostName] = {ids: {}, signals: {}}; }
	 // console.log('getMapTree:', hosts, json);
					resolve(json);
					hosts[hostName].layerTree = json.res.Result;
					hosts[hostName].parseLayers = parseTree(json.res);
					if (apiKey) {
						hosts[hostName].apiKeyPromise = apiKeyPromise;
						hosts[hostName].apiKey = apiKey;
					}
				})
			});
		}
	});
};

const _parseGeo = (pars) => {
	let observer = pars.observer,
		tn = observer.pars.coords,
		itemData = pars.itemData,
		item = itemData.item,
		
		geo = item[item.length - 1],
		geoType = geo.type,
		out;
	
    if (geoType === 'POLYGON' || geoType === 'MULTIPOLYGON') {
		let coords = geo.coordinates;
		if (geoType === 'POLYGON') { coords = [coords]; }
		out = utils.getCoordsPixels({
			coords: coords,
			z: tn.z,
			tpx: pars.tpx,
			tpy: pars.tpy
		});
	}
	return out;
};

const drawTest = (pars) => {
	const canvas = new OffscreenCanvas(256, 256),
	// const canvas = message.canvas,
		w = canvas.width,
		h = canvas.height,
		ctx = canvas.getContext('2d');
		// gl = canvas.getContext('webgl');
	// ctx.fillStyle = 'red';
	// ctx.lineWidth = 5;
	// ctx.rect(5, 5, w - 5, h - 5);
	// ctx.fill();
	
	Renderer2d.updatePoly({
		coords: pars.coords,
		_drawing: true,
		closed: true,
		_ctx: ctx,
		canvas: canvas,
		w: w,
		h: h,
		options: pars.options || {
			fillRule: 'evenodd',
			_dashArray: null,
			lineCap: "butt",
			lineJoin: "miter",
			color: "green",
			fillColor: "blue",
			interactive: true,
			smoothFactor: 1,
			weight: 10,
			opacity: 1,
			fillOpacity: 1,
			stroke: true,
			fill: false
		},
		_parts: pars._parts || [[{"x":0,"y":0},{"x":255,"y":255},{"x":255,"y":0},{"x":0,"y":255}]]
		// _parts: message._parts || [[{"x":54,"y":40},{"x":95,"y":40},{"x":95,"y":88}]]
	});
	// delete message. ;
	// message.out = {done: true};
	// let bitmap = canvas.transferToImageBitmap();
	return {
		bitmap: canvas.transferToImageBitmap()
	};
};

const setDateInterval = (pars) => {
	pars = pars || {};
	let host = hosts[pars.hostName];
	if (host && host.ids[pars.id]) {
		host.ids[pars.id].dateBegin = pars.dateBegin;
		host.ids[pars.id].dateEnd = pars.dateEnd;
	}
	utils.now();

// console.log('setDateInterval:', pars, hosts);
};

const _iterateNodeChilds = (node, level, out) => {
	level = level || 0;
	out = out || {
		layers: [],
		layersByID: {}
	};
	
	if (node) {
		let type = node.type,
			content = node.content,
			props = content.properties;
		if (type === 'layer') {
			let ph = {
				properties: props,
				level: level
			};
			// let ph = utils.parseLayerProps(props);
			// ph.level = level;
			if (content.geometry) { ph.geometry = content.geometry; }
			out.layers.push(ph);
			out.layersByID[props.name] = ph;
		} else if (type === 'group') {
			let childs = content.children || [];
			out.layers.push({ level: level, group: true, childsLen: childs.length, properties: props });
			childs.map((it) => {
				_iterateNodeChilds(it, level + 1, out);
			});
		}
		
	} else {
		return out;
	}
	return out;
};

const parseTree = (json) => {
	let out = {};
	if (json.Status === 'error') {
		out = json;
	} else if (json.Result && json.Result.content) {
		out = _iterateNodeChilds(json.Result);
		out.mapAttr = out.layers.shift();
	}
// console.log('______json_out_______', out, json)
	return out;
};

*/

/*
    _parseItem: function(it) {
        var len = it.length - 1,
			// props = new Uint32Array(len),
			i;

        // props[0] = it[0];
		// TODO: old properties null = ''
        for (i = 1; i < len; i++) {
            if (it[i] === null) { it[i] = ''; }
			// props[i] = this._getLinkProp(i, it[i]);
        }

        var geo = it[len],
            needFlatten = this.isFlatten,
            type = geo.type,
            isLikePolygon = type.indexOf('POLYGON') !== -1 || type.indexOf('Polygon') !== -1,
            isPolygon = type === 'POLYGON' || type === 'Polygon',
            coords = geo.coordinates,
            hiddenLines = [],
            bounds = null,
            boundsArr = [];

        if (isLikePolygon) {
            if (isPolygon) { coords = [coords]; }
            bounds = gmxAPIutils.bounds();
            var edgeBounds = gmxAPIutils.bounds().extendBounds(this.bounds).addBuffer(-0.05),
                hiddenFlag = false;
            for (i = 0, len = coords.length; i < len; i++) {
                var arr = [],
                    hiddenLines1 = [];

                for (var j = 0, len1 = coords[i].length; j < len1; j++) {
                    if (needFlatten && typeof coords[i][j][0] !== 'number') {
                        coords[i][j] = gmxAPIutils.flattenRing(coords[i][j]);
                    }
                    var b = gmxAPIutils.bounds(coords[i][j]);
                    arr.push(b);
                    if (j === 0) { bounds.extendBounds(b); }
                    // EdgeLines calc
                    var edgeArr = gmxAPIutils.getHidden(coords[i][j], edgeBounds);
                    hiddenLines1.push(edgeArr);
                    if (edgeArr.length) {
                        hiddenFlag = true;
                    }
                }
                boundsArr.push(arr);
                hiddenLines.push(hiddenLines1);
            }
            if (!hiddenFlag) { hiddenLines = null; }
            if (isPolygon) { boundsArr = boundsArr[0]; }
        } else if (type === 'POINT' || type === 'Point') {
            bounds = gmxAPIutils.bounds([coords]);
        } else if (type === 'MULTIPOINT' || type === 'MultiPoint') {
            bounds = gmxAPIutils.bounds();
            for (i = 0, len = coords.length; i < len; i++) {
                bounds.extendBounds(gmxAPIutils.bounds([coords[i]]));
            }
        } else if (type === 'LINESTRING' || type === 'LineString') {
            bounds = gmxAPIutils.bounds(coords);
        } else if (type === 'MULTILINESTRING' || type === 'MultiLineString') {
            bounds = gmxAPIutils.bounds();
            for (i = 0, len = coords.length; i < len; i++) {
                bounds.extendBounds(gmxAPIutils.bounds(coords[i]));
            }
        }
        var dataOption = {
            id: it[0],
            type: type,
			processing: this.processing,
			currentFilter: null,
            properties: it,
			options: {
				fromTiles: {},
				isGeneralized: this.isGeneralized
			},
			// options: {
				// fromTiles: {5_23_6_52334_14179_1: 1},
				// unixTimeStamp: 1540599811000
			// },
            // props: props,
            bounds: bounds,
            boundsArr: boundsArr
        };
        if (hiddenLines) {
            dataOption.hiddenLines = hiddenLines;
        }
        return dataOption;
    }

const _parseItem = ({item, st, bounds, hiddenLines, pars}) => {
	// let geo = item[item.length - 1],
		// type = geo.type,
		// z = pars.z;
	// EdgeLines calc
	// var edgeArr = gmxAPIutils.getHidden(coords[i][j], edgeBounds);
	// hiddenLines1.push(edgeArr);
	// if (edgeArr.length) {
		// hiddenFlag = true;
	// }

	return {
	};
};
// const COMPARS = {WrapStyle: 'None', ftc: 'osm', srs: 3857};
*/
const optDef = {
	...Requests.COMPARS,
	ModeKey: 'map',
	skipTiles: 'All',
	sw: 1,
	MapName: 'DefaultMap'
};	
// const optDef = {
	// WrapStyle: 'none',
	// ModeKey: 'map',
	// ftc: 'osm',
	// skipTiles: 'All',
	// srs: 3857,
	// sw: 1,
	// MapName: 'DefaultMap'
// };
const getMap = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || Utils.HOST;
	// if (!hosts[hostName]) { hosts[hostName] = {}; }
	// let host = hosts[hostName];

	if (pars.mapId) { pars.MapName = pars.mapId; }
	let attr = {...optDef, ...pars.attr, sw: 0};
// console.log('getMap', pars);
	const url = '//' + hostName + '/TileSender.ashx?' + Requests.getFormBody(attr) + '&' + Date.now();
	const opt = {
		method: 'get',
		// headers: {'Content-type': 'application/x-www-form-urlencoded'},
	// headers: {'Accept': 'application/json'},
	// body: JSON.stringify(params)	// TODO: сервер почему то не хочет работать так 
	};
	return fetch(url, opt)
	// .then(res => res.json())
	.then(res => {
		const contentType = res.headers.get('Content-Type');
		let out = {};
		if (contentType.indexOf('application/json') > -1 ||				// application/json; charset=utf-8
			contentType.indexOf('text/javascript') > -1) {	 			// text/javascript; charset=utf-8
// console.log('getMap', res.headers.get('Content-Type'));
			out = res.json();
		}
		return out;
	})
	.then(function(res) {
		if (res.Status === 'ok' && res.Result) {
			const parsed = parseMapTree(res.Result, hostName)
			hosts[hostName] = {
				ids: {},
				signals: {},
				...hosts[hostName],
				...parsed
			};
			parsed.parseLayers.isVisible.forEach(it => {addSource(it)});

		// console.log('hosts', hosts);
			// if (hosts[hostName].needStart && !intervalID) { utils.start(); }
		}
		return {from: pars, ...res};
		// return utils.chkResponse(res, options.type);
	})
};
const parseMapTree = (mapInfo, hostName) => {
	// const host = hosts[hostName] || {ids: {}, signals: {}};
	const props = mapInfo.properties;
	const outInfo = {
		children: mapInfo.children,
		properties: props
	};
	const lHash = {};
	const lArr = [];
	const isVisible = [];
	let needStart = false;
	const fun = (it, i) => {
		if (it.type === 'layer') {
			let c = {...it.content};
			let prp = c.properties;
			// let pl = Utils.parseLayerProps(prp);
			c = {...c, ...Utils.parseStyles(prp)};
			// c = {...c, ...Utils.parseStyles(prp)};
			const LayerID = prp.LayerID;
			if (prp.type === 'Vector') {
				if (prp.visible) {
					needStart = true;
					isVisible.push({id: LayerID, hostName, c});
					// addSource({id: LayerID, hostName});
				}
				// c = {...c, ...Utils.parseStyles(prp)};
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
		// ids,
		// signals: {},
		needStart,
		// ...host
	};

	// gmxMap.layersCreated.then(function() {
		// gmxMap.layersCreatePromise(outInfo).then(function() {
			// resolve(json.Result);
		// });
	// });
};
const _parseNode = (treeInfo, callback, onceFlag) => {
// console.log('iterateNode',treeInfo, callback, onceFlag);
	const iterate = (node) => {
		const arr = node.children || [];
		for (let i = 0, len = arr.length; i < len; i++) {
			let layer = arr[i];

			if (callback(layer, node) && onceFlag) { break; }
			if (layer.type === 'group') {
				iterate(layer.content);
			}
		}
	};

	treeInfo && iterate(treeInfo);
};


const drawItem = (pars) => {
	let observer = pars.observer,
		ctx = observer.ctx,
		style = pars.style || {},
		itemData = pars.itemData,
		item = itemData.item,
		geo = item[item.length - 1],
		type = geo.type,
		coords = observer.pars.coords,
		tz = Math.pow(2, coords.z);

	let	pt = {
		mInPixel: 256 * tz / Utils.WORLDWIDTHFULL,
		_drawing: true,
		_ctx: ctx,
		tpx: 256 * (coords.x % tz - tz/2),
		tpy: 256 * (tz/2 - coords.y % tz),
		itemData: itemData,
		options: style.renderStyle || {}
	};
	// if (coords.z === 13 && coords.x === 4835 && coords.y === 2552) {
// console.log('vvvvvvvvvv ___coords____ ', coords, pt);
	// }
	if (!ctx) {
		const canvas = new OffscreenCanvas(256, 256);
		canvas.width = canvas.height = 256;
		observer.canvas = canvas;
		pt._ctx = observer.ctx = canvas.getContext('2d');
	}

	// pt._ctx.fillText(coords.x + ':' + coords.y + ':' + coords.z, 128, 128);
	// Renderer2d.updatePoly(pt);
	Renderer2d.updatePolyMerc(pt);
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
		hostLayers = hosts[hostName];

	if (hostLayers && hostLayers.ids && hostLayers.ids[layerID]) {
		let observers = hostLayers.ids[layerID].observers;
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
		Observer.addObserver({ type: 'screen', coords, zKey: coords.x + ':' + coords.y + ':' + coords.z + '_' + cmdNum , ...message})
	));
};

export default {
	hosts,
	getMap,
	getTile,
	// getTiles,
	drawItem,
	// getMapTree,
	// moveend,
	// setDateInterval,
	addObserver: Observer.addObserver,
	removeObserver: Observer.removeObserver,
	removeSource,
	addSource
};