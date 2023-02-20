import Utils from './Utils';
import Requests from './Requests';
import DataVersion from './DataSourceVersion';

let _checkObserversTimer = null;
const waitCheckObservers = () => {
	if (_checkObserversTimer) { clearTimeout(_checkObserversTimer); }
	_checkObserversTimer = setTimeout(checkObservers, 25);
};

// const mousemove = (pars) => {
	// const {hostName = 'maps.kosmosnimki.ru'} = pars;
	// const ids = DataVersion.hosts[hostName].ids;
	// const arr = Object.values(ids).filter(it => it.tilesPromise);

	// return {from: pars, ...{hh: 5}};
// };

const checkObservers = () => {
	// console.log('checkObservers _______________:', hosts);
	const hosts = DataVersion.hosts;
	Object.keys(hosts).forEach(host => {
		let	hostItem = hosts[host];
						let out = [];
		Object.keys(hostItem.ids).forEach(layerID => {
			let	tData = hostItem.ids[layerID],
				layerData = hostItem.parseLayers.layersByID[layerID],
				styles = layerData.styles,
				// oKeys = Object.keys(tData.observers),
				observers = tData.observers || {},
				indexes = tData.tileAttributeIndexes,
				tilesPromise = tData.tilesPromise;
			if (tilesPromise && Object.keys(observers).length) {
				if(styles) {
					// const styles = arrStyle || [];
					let _maxStyleSize = layerData.properties._maxStyleSize || 128;
					Object.keys(observers).forEach(key => {
						let observer = observers[key];
						if (!observer.bounds) {
							let coords = observer.pars.coords,
								z = observer.pars.z;
							_maxStyleSize = Utils._getMaxStyleSize(z, styles);

							// var mercSize = 2 * _maxStyleSize * WORLDWIDTHFULL / Math.pow(2, 8 + z); //TODO: check formula

							observer.bounds = Utils.getTileBounds(coords);
						}
						
					});
					Promise.all(Object.values(tilesPromise)).then((arrTiles) => {
						out.push(_checkVectorTiles({
							sort: layerData.sorting,
							arrTiles: arrTiles,
							observers: observers,
							styles: styles,
							indexes: indexes
						}));
			// console.log('checkObservers _____2__________:', out);
						for (let zKey in observers) {
							let observer = observers[zKey],
								pars = observer.pars;

							if (observer.canvas) {
								pars.bitmap = observer.canvas.transferToImageBitmap();
							} else {
								pars.items = out;
								// pars.data = {layerID: observer.layerID, items: out};
								// pars.data = {items: out};
							}
							observer.resolver(pars);
							delete observers[zKey];
						}


						/*
						for (let i = 0, len = arrTiles.length; i < len; i++) {
							let tile = arrTiles[i],
								styleNums = tile.styleNums,
								itemsbounds = tile.itemsbounds;
							if (!styleNums) {styleNums = tile.styleNums = [];}
							if (!itemsbounds) {itemsbounds = tile.itemsbounds = [];}
							for (let j = 0, len1 = oKeys.length; j < len1; j++) {
								let zKey = oKeys[j],
									observer = tData.observers[zKey];

								if (!observer || !observer.bounds.intersects(tile.bounds)) {continue;}

								if (!observer.tcnt) {observer.tcnt = 0;}
								observer.tcnt++;
								observer.items = [];
								tile.values.forEach((it, n) => {
									let geo = it[it.length - 1],
										st = styleNums[n],
										bounds = itemsbounds[n];
									if (st === undefined) {st = styleNums[n] = getStyleNum(it, styles, tData.tileAttributeIndexes, observer.pars.z);}
									if (!bounds) {bounds = itemsbounds[n] = Requests.geoItemBounds(geo);}

									observer.items.push(it);
								});
							}
						}
						*/
			// console.log('checkObservers _____1__________:', hosts, arrStyle);
					});
				}
			}
		});
	});
};

const _checkVectorTiles = ({arrTiles, observers, styles, indexes, sort}) => {
	let out = [];
// console.log('_checkVectorTiles ____:', arrTiles.length);
	for (let i = 0, len = arrTiles.length; i < len; i++) {
		let tile = arrTiles[i];
		if (tile) {
			let pixels = tile.pixels,
				styleNums = tile.styleNums,
				itemsbounds = tile.itemsbounds,
				hiddenLines = tile.hiddenLines;
			if (!styleNums) {styleNums = tile.styleNums = [];}
			if (!itemsbounds) {itemsbounds = tile.itemsbounds = [];}
			if (!hiddenLines) {hiddenLines = tile.hiddenLines = [];}
			if (!pixels) {pixels = tile.pixels = [];}
			for (let zKey in observers) {
				let observer = observers[zKey];
				// let flag = observer.bounds.intersects(tile.bounds);

				// if (!observer.bounds.intersects(tile.bounds)) {
					// continue;
				// }

				if (!observer.tcnt) {observer.tcnt = 0;}
				observer.tcnt++;
				observer.items = [];
				tile.values.forEach((it, nm) => {
					if (_isValidItem({
						// hiddenLines: hiddenLines[n],
						// bounds: itemsbounds[n],
						// st: styleNums[n],
						indexes,
						styles,
						observer,
						tile,
						nm,
						item: it
					})) {
						if (observer.type === 'screen') {
							let st = styleNums[nm];
							let pt = {
								tbbox: tile.bbox,
								st,
								style: styles[st],
								itemData: {
									bounds: itemsbounds[nm],
									hiddenLines: hiddenLines[nm],
									item: it
								}
							};
							// TODO: если НЕТ сортировки объектов то тут отрисовка иначе после сортировки
							if (sort) {
								observer.items.push(pt);
							} else {
								pt.observer = observer;
								DataVersion.drawItem(pt);
							}
						} else {
							// out.push(it);
							out.push({layerID: observer.layerID, items: it});
						}
					}
				});
			}
		}
	}
	return out;
// console.log('checkObservers _____1__________:', hosts);
};

const _isValidItem = ({nm, item, observer, tile, styles, indexes}) => {
	let bounds = tile.itemsbounds[nm];
	let geo = item[item.length - 1];
	if (!bounds) {
		bounds = Requests.geoItemBounds(geo);
		tile.itemsbounds[nm] = bounds;
	}
	let flag = false;
	if (observer.bounds.intersects(bounds.bounds)) {
		flag = true;
		let st = tile.styleNums[nm];
		if (st === undefined) {
			st = Utils.getStyleNum(item, styles, indexes, observer.pars.z);
			tile.styleNums[nm] = st;
		}
	} else {
// console.log('_chkSkipItem _____1__________:', bounds.bounds, item, observer.bounds);
	}

	if (flag && observer.type === 'mousemove') {
		flag = _chkHoverItem(geo, bounds.boundsArr, observer.pars.attr.merc, observer.bounds);
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

const addObserver = (pars) => {
	const hosts = DataVersion.hosts;

// console.log('addObserver_______________:', pars, hosts);
	return new Promise((resolve) => {
		let layerID = pars.layerID,
			type = pars.type || 'screen',
			zKey = pars.zKey || type,
			host = hosts[pars.hostName || Utils.HOST],
			out = {...pars};
		if (host && host.ids) {
			if (layerID) {
				let	tData = host.ids[layerID] || {};
				if (!tData.observers) { tData.observers = {}; }
				tData.observers[zKey] = {
					bounds: pars.bbox || '',
					type,
					pars: pars,
					resolver: resolve
				};
				host.ids[layerID] = tData;
			} else {
				const merc = pars.attr.merc;
				const bounds = Requests.bounds().extend(merc.x, merc.y).addBuffer(0.5);
				const arr = Object.values(host.ids).map(it => {
					return new Promise(function(done, cancel) {
						layerID = it.id;
						it.observers[zKey] = {
							layerID,
							bounds,
							type,
							pars: pars,
							resolver: done
						};
					})
				});
				Promise.all(arr).then(res => {
// console.log('arr   :', res);
				let items = {};
					res.forEach(it => {
						(it.items || []).forEach(it1 => {
							(it1 || []).forEach(it2 => {
// console.log('arr ____1_______:', it2);
								let layerID = it2.layerID;
								if (!items[layerID]) items[layerID] = [];
								items[layerID].push(it2.items);
						// it.items
							});
						});
					});
					resolve(items);
				});
			}
// console.log('addObserver ____1_______:', tData);
			// start Recheck Observers on next frame
			waitCheckObservers();
		} else {
			out.error = 'Нет слоя: ' + layerID;
			resolve(out);
		}
	});
};

const removeObserver = (pars) => {
	const hosts = DataVersion.hosts;
	let host = hosts[pars.hostName];
	if (host && host.ids[pars.layerID]) {
		let observers = host.ids[pars.layerID].observers;
		if (observers) {
			observers[pars.zKey].resolver([]);
			delete observers[pars.zKey];
		}
	}
console.log('removeObserver _______________:', pars, hosts);
};

export default {
	waitCheckObservers,
	addObserver,
	removeObserver
};