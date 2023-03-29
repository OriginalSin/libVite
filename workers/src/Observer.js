import Utils from './Utils';
import Requests from './Requests';
import DataVersion from './DataSourceVersion';

let _timerCheck;
let _checkObserversTimer = null;
const waitCheckObservers = () => {
	if (_timerCheck) cancelAnimationFrame(_timerCheck);
	_timerCheck = requestAnimationFrame(checkObservers, {timeout: 0});
	// if (_checkObserversTimer) { clearTimeout(_checkObserversTimer); }
	// _checkObserversTimer = setTimeout(checkObservers, 25);
};

// const labelObserver = { type: 'labels', zKey: 'labels', layers: {} };
const observers = {
	labels: { type: 'labels', zKey: 'labels', layers: {}, items: [] }
};

// const mousemove = (pars) => {
	// const {hostName = 'maps.kosmosnimki.ru'} = pars;
	// const ids = DataVersion.hosts[hostName].ids;
	// const arr = Object.values(ids).filter(it => it.tilesPromise);

	// return {from: pars, ...{hh: 5}};
// };

const getObservers = (type) => {
	let out = [];
	let tp = {};
	let screen = Object.keys(observers.screen || []).length;
	if (screen) {
		// if (Object.keys(observers.labels.layers).length) out.push(observers.labels);
		Object.values(observers.screen || []).forEach(it => {
			out = out.concat(Object.values(it).map(pt => {
				let key = pt.layerID;
				let tilesPromise = pt.layerData.ids.tilesPromise;
				Object.keys(tilesPromise || {}).map(k => {
					tp[key + '_' + k] = tilesPromise[k];
				});

				return pt;
			}));
		});
		// out.push(observers.mousemove);
	}
	if (observers.mousemove) {
		Object.values(observers.mousemove.layerData.allIds).forEach(pt => {
			let key = pt.id;
			let tilesPromise = pt.tilesPromise;
			Object.keys(tilesPromise || {}).map(k => {
				tp[key + '_' + k] = tilesPromise[k];
			});
		});
		// console.log('mousemove _______________:', tp);
		out.push(observers.mousemove);
	}
	return { obs: out, tp: Object.values(tp)};
};
/*
const getTileItems = (t, o) => {
	// let oArr = obs.filter(o => o.layerID === t.LayerName);
	let layerID = t.LayerName;
			// let styleNums = tile.styleNums,
				// pProps = tile.pProps,
				// itemsbounds = tile.itemsbounds,
				// paths = tile.paths || [],
};
*/
const checkObservers = () => {
	const {obs, tp} = getObservers('screen');
	observers.labels.items = [];
		// console.log('tp _______________:', obs, tp);
	Promise.all(tp).then(tiles => {
		// console.log('tiles _______________:', obs, tiles);
		tiles.forEach(t => {
			if (!t) return;
			let oArr = obs.filter(o => o && (o.type === 'mousemove' || (o.layerID && o.layerID === t.LayerName)));
			t.values.forEach((it, nm) => {
				oArr.forEach(observer => {
					getItemValue({observer, tile: t, nm});
				});
			});
		});
	// DataVersion.setHover({});
		obs.forEach(observer => {
			if (!observer) return;
			// тут сортировки
				
			if (observer.type === 'screen' && observer.items) {
				observer.items.forEach(pt => {
					pt.observer = observer;
					DataVersion.drawItem(pt); // вызов отрисовки
				});
				if (observers.labels.layers[observer.layerID]) {
					observers.labels.items = [...observers.labels.items, ...observer.items];
					// observers.labels.items = observers.labels.items.concat(observer.items);
				}
			}

			let pars = observer.pars;
			let out = observer.queue || {};

				// cmdNum: pars.cmdNum,
				// items: pars.items,
			// };
			if (observer.canvas) {
				let bitmap = observer.canvas.transferToImageBitmap();
				// observer.bitmap = bitmap;
				out.bitmap = bitmap;
				// pars.queue.bitmap = bitmap;
				// if (pars.queues) {
					// pars.queues.find((it, i) => {
						// if (it.zKey === observer.zKey) { it.bitmap = bitmap; return true; }
						// return false;
					// });
				// } else pars.bitmap = bitmap;
			} else {
				out.items = observer.items;
			}
			observer.resolve(out); // ответ в браузер
			remove(observer);
			// delete observers[zKey];
		});
		DataVersion.drawLabels(observers.labels.items); // вызов отрисовки labels
// console.log('observers.labels.items _______________:', observers.labels.items);

		
	});
};

const getItemValue = ({nm, observer, tile}) => {
	let layerID = tile.LayerName;
	let item = tile.values[nm];
	let bounds = tile.itemsbounds[nm];
	let geo = item[item.length - 1];
	if (!bounds) {
		bounds = Requests.geoItemBounds(geo);
		tile.itemsbounds[nm] = bounds;
	}


	let ids = observer.layerData.ids;
	if (!ids) {
		ids = observer.layerData.allIds[layerID];
	}
	const indexes = ids.tileAttributeIndexes;
	const types = ids.tileAttributeTypes;
	const styles = ids.pProps.styles;

	const type = observer.type;

	let flag = false;
	if (observer.bounds && observer.bounds.intersects(bounds.bounds)) {
		flag = true;
		let st = tile.styleNums[nm];
		if (st === undefined) {
			st = Utils.getStyleNum(item, styles, indexes, observer.z);
			tile.styleNums[nm] = st;
		}
	} else {
// console.log('_chkSkipItem _____1__________:', bounds.bounds, item, observer.bounds);
	}

	if (flag && observer.type === 'mousemove') {
		flag = _chkHoverItem(geo, bounds.boundsArr, observer.pars.attr.merc, observer.bounds);
	}
	if (flag) {
		if (type === 'screen' || type === 'labels') {
			let st = tile.styleNums[nm];
			let pt = {
					tile,
					nm,
				tbbox: tile.bbox,
				st,
				style: styles[st],
				indexes,
				types,
				itemData: {
					bounds: tile.itemsbounds[nm],
					paths: tile.paths[nm],
					hiddenLines: tile.hiddenLines[nm],
					layerID: tile.LayerName,
					item
				}
			};
			// TODO: если НЕТ сортировки объектов то тут отрисовка иначе после сортировки
			// if (sort) {
				observer.items.push(pt);
			// } else {
				// pt.observer = observer;
				// DataVersion.drawItem(pt);
			// }
		// } else if (type === 'labels') {
			// observer.items.push(pt);
		} else {
			// observer.items.push({layerID: observer.layerID, items: it});
			// out.push(it);
			// out.push({layerID, items: it});
			observer.items.push({layerID, items: item});
		}
	}

	return flag;
};

const _chkHoverItem = (geo, boundsArr, merc, bounds) => {
		let flag = false;
		let type = geo.type;
		let coords = geo.coordinates;
		const chkPoint = [merc.x, merc.y];
		
		// let fill = currentStyle.fillStyle || currentStyle.canvasPattern || parsedStyle.bgImage ||
			// ('fillColor' in parsedStyle) || parsedStyle.fillPattern;
		// let	marker = parsedStyle && parsedStyle.image ? parsedStyle.image : null;
		let	chktype = type;
		// let boundsArr = bounds.boundsArr;
		
				// if (type === 'MULTIPOLYGON' || type === 'POLYGON') {
					// if (marker) {
						// chktype = 'POINT';
					// } else if (!fill) {
						// if (type === 'POLYGON') {
							// chktype = 'MULTILINESTRING';
							// hiddenLines = hiddenLines[0];
						// } else {
							// chktype = 'LIKEMULTILINESTRING';
						// }
						// ph.hidden = hiddenLines;
					// }
				// }

		if (chktype === 'LINESTRING') {
			// if (!gmxAPIutils.isPointInPolyLine(mercPoint, lineWidth / mInPixel, coords)) {
				// nodePoint = gmxAPIutils.bounds([point]).addBuffer(offset[0] / mInPixel, offset[1] / mInPixel).isNodeIntersect(coords);
				// if (nodePoint === null) { continue; }
			// }
		} else if (chktype === 'LIKEMULTILINESTRING') {
			// ph.delta = lineWidth / mInPixel;
			// var flag = false;
			// for (j = 0, len = coords.length; j < len; j++) {
				// ph.coords = coords[j];
				// ph.hidden = hiddenLines ? hiddenLines[j] : null;
				// ph.boundsArr = boundsArr[j];
				// if (gmxAPIutils.isPointInLines(ph)) {
					// flag = true;
					// break;
				// }
			// }
			// if (!flag) { continue; }
		} else if (chktype === 'MULTILINESTRING') {
			// ph.delta = lineWidth / mInPixel;
			// ph.hidden = hiddenLines;
			// if (!gmxAPIutils.isPointInLines(ph)) {
				// var pBounds = gmxAPIutils.bounds([point]).addBuffer(offset[0] / mInPixel, offset[1] / mInPixel);
				// for (j = 0, len = coords.length; j < len; j++) {
					// nodePoint = pBounds.isNodeIntersect(coords[j]);
					// if (nodePoint !== null) {
						// nodePoint.ring = j;
						// break;
					// }
				// }
				// if (nodePoint === null) { continue; }
			// }
		} else if (chktype === 'MULTIPOLYGON' || chktype === 'POLYGON') {
			flag = false;
			if (chktype === 'POLYGON') {
				coords = [geo.coordinates];
				boundsArr = [boundsArr];
			}
			for (let j = 0, len = coords.length; j < len; j++) {
				let arr = coords[j],
					bbox = boundsArr[j];
				for (let j1 = 0, len1 = arr.length; j1 < len1; j1++) {
					let b = bbox[j1];
					if (b.intersects(bounds)) {
						if (Utils.isPointInPolygonWithHoles(chkPoint, arr)) {
							flag = j1 === 0 ? true : false;
							break;
						}
					}
				}
			}
			// if (!flag) { continue; }
		} else if (chktype === 'POINT') {
			// if (parsedStyle.type === 'circle') {
				// var x = (coords[0] - point[0]) * mInPixel,
					// y = (coords[1] - point[1]) * mInPixel;
				// if (x * x + y * y > radius * radius) { continue; }
			// }
		}
	return flag;
};

const addArray = (pars) => {
	let message = pars.attr;
	let hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		queues = message.queues,
		cmdNum = message.cmdNum,
		z = message.z,
		hostLayers = hosts[hostName];
 console.log('addArray :',  pars);
	return Promise.all(queues.map(it => 
		Observer.add({ type: 'screen', coords: it.coords, zKey: it.coords.x + ':' + it.coords.y + ':' + it.coords.z + '_' + cmdNum , ...message})
		// addObserver(Requests.extend({
			// coords: it.coords,
			// zKey: it.coords.x + ':' + it.coords.y + ':' + it.coords.z
		// }, message))
	));

};
const add = (pars) => {
	let layerID = pars.layerID,
		type = pars.type || 'screen',
		zKey = pars.zKey || type,
		// host = hosts[pars.hostName || Utils.HOST],
		out = {...pars};
	let id = pars.zKey || pars.type || pars.layerID;
	let prom = new Promise(resolve => {
		let data = {resolve, ...pars, items: [], layerData: getLayerData(pars)};
		if (data.coords) {
			data.key = data.coords.x + ':' + data.coords.y + ':' + data.coords.z;
			if (!data.bounds) data.bounds = Utils.getTileBounds(data.coords);
		}
		data.pars = pars;
		// data.key = pars;
		observers[type] = observers[type] || {};
		if (type === 'screen') {
			observers[type][layerID] = observers[type][layerID] || {};
			observers[type][layerID][zKey] = data;
			if (data.layerData?.props._styleHooksFlag) observers.labels.layers[layerID] = true;
		} else if (type === 'mousemove') {
			const merc = pars.attr.merc;
			data.bounds = Requests.bounds().extend(merc.x, merc.y).addBuffer(0.5);
			observers[id] = data;
		} else {
			observers[id] = data;
		}
	// }).then(res => res.items
 // console.log('res :',  res);
		// return res.items;
	});
	if (!pars.wait) {
		// if (_timerCheck) cancelAnimationFrame(_timerCheck);
		// _timerCheck = requestAnimationFrame(checkObservers, {timeout: 50});
	}
	return prom;

};

const remove = (id) => {
	if (typeof(id) === 'object') {
		let type = id.type;
		let obs = observers[id.type];
		if (type === 'screen' && obs && obs[id.layerID]) {
			delete obs[id.layerID][id.zKey];
		} else if (type !== 'labels') {
			delete observers[id.type];
		}
	} else {
		delete observers[id];
	}
};

const removeLayer = (id) => {
	delete observers.labels.layers[id];
	if (observers.screen) delete observers.screen[id];

};

const getLayerData = ({layerID, hostName = Utils.HOST} = pars) => {
	const host = DataVersion.hosts[hostName] || {};
	const ids = host?.ids;
	const parseLayers = host?.parseLayers;
	return {
		ids: ids[layerID],
		props: parseLayers.layersByID[layerID]?.properties || {},
		allIds: ids,
		parseLayers
	};
};
export default {
	waitCheckObservers,
	removeLayer,
	addArray,
	add,
	remove
};