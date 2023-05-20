import Utils from './Utils';
import Requests from './Requests';


const w = 256, h = 256;
let canvas = new OffscreenCanvas(w, h);
canvas.width = w; canvas.height = h;
// const _ctxTest = canvas.getContext('2d', { willReadFrequently: true });
const _getVisibleItems = (obs, pars) => {
	// if (geoItems.length < 2) {
		// this.itemsView = geoItems;
		// return geoItems;
	// }

	let i, len,
		ts = 256,
		ctx = canvas.getContext('2d', { willReadFrequently: true }),
		// scrTile = pars.scrTile,
		matrix = obs.matrix;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.imageSmoothingEnabled = false;

	let nm = 0;
	obs.tiles.forEach((geoItems, j) => {
		for (i = 0, len = geoItems.paths.length; i < len; i++) {
			nm++;
			ctx.fillStyle = Utils.dec2rgba(nm, 1);
			let paths = geoItems.paths[i];
			let fPath = new Path2D();
			paths.forEach(it => it.forEach(it2 => {
				if (it2[0]) fPath.addPath(it2[1], matrix);
			}));
			ctx.fill(fPath);
		}
	});
	let items = {},
		data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

	for (i = 0, len = data.length; i < len; i += 4) {
		if (data[i + 3] === 255) {
			let color = data[i + 2];
			if (data[i + 1]) { color += (data[i + 1] << 8); }
			if (data[i]) { color += (data[i] << 16); }
			if (color) { items[color] = true; }
		}
	}
	let out = [];
 // console.log('_getVisibleItems :',  items);
 	nm = 0;
	let rprom = [];
	obs.tiles.forEach(geoItems => {
		geoItems.values.forEach((it, inum) => {
			nm++;
			if (items[nm]) {
				rprom.push(_getItemRasters(inum, geoItems, obs));
			}
		});
	});

/*
	for (let num in items) {
		let it = geoItems[Number(num) - 1];
		if (it) {
			// it.rasterPromises = _getItemRasters(it, pars);
			out.push(it);
		}
	}
*/
	// this.itemsView = out;
 // console.log('_getVisibleItems :',  rprom.length);
 	return Promise.all(rprom).then(res => {
		let out = {};
		res.forEach(h => {
			out = {...out, ...h};
		});

		return Promise.resolve(out);
	});

	// return out;
/**/
};

const getNeedRasterItems = async (obs) => {
 // console.log('_getNeedRasterItems :',  obs);
	const notPromise = new Promise(resolve => { resolve([]); });
	// if (!obs.items.length) {
 // console.log('notPromise :',  obs);
		// return [];
		// return notPromise;
	// }
	let	lprops = obs.properties,
		layerID = lprops.layerID,
		tiles = obs.tiles,
		mapSize = obs.mapSize,
		// ids = obs.layerData.ids,
		// lData = obs.layerData.parseLayers.layersByID[layerID],
		// lprops = obs.properties,
		identityField = lprops.identityField;
	if (!lprops.IsRasterCatalog) return notPromise;
	// if (!lprops.IsRasterCatalog) return notPromise;
	if (mapSize && (mapSize.x !== canvas.width || mapSize.y !== canvas.height)) {
		const w = mapSize.x, h = mapSize.y;
		canvas = new OffscreenCanvas(w, h);
		canvas.width = w; canvas.height = h;
	}
	let viz = await _getVisibleItems(obs);
// console.log('viz:', viz);

return viz;
	let	items = obs.items,
		gmx = lprops.gmx || {},
		zoom = obs.coords.z,
		tbounds = obs.bounds,
		out = [];

	for (let i = 0, len = items.length; i < len; i++) {
		let it = items[i],
			indexes = it.indexes,
			itemData = it.itemData,
			pArr = itemData.item,
			idr = pArr[indexes[identityField]],
			// dataOption = geo.dataOption || {},
			skipRasters = false;

		if (gmx.quicklookBGfunc && !pArr[indexes['GMX_RasterCatalogID']]) {
		// if (gmx.quicklookBGfunc && !gmxAPIutils.getPropItem('GMX_RasterCatalogID', properties, indexes)) {
			if (gmx.minZoomQuicklooks && zoom < gmx.minZoomQuicklooks) continue;
			var platform = pArr[indexes[gmx.quicklookPlatform]] || gmx.quicklookPlatform || '';
			// if ((!platform || platform === 'imageMercator') &&
				// !gmxAPIutils.getQuicklookPointsFromProperties(properties, gmx)
			// ) {
				// continue;
			// }
		}

		if (gmx.styleHook) {
			it.styleExtend = gmx.styleHook(
				gmx.dataManager.getItem(idr),
				gmx.lastHover && idr === gmx.lastHover.id
			);
			skipRasters = it.styleExtend && it.styleExtend.skipRasters;
		}
		if (!skipRasters && tbounds.intersectsWithDelta(itemData.bounds.bounds, -1, -1)) {
			out.push(it);
		}
/*
*/
	}
	// return out;
	return _getVisibleItems(out, obs);

};
/**/
const requests = {};
const rastersCache = {};
const _getItemRasters = (inum, geoItems, pars) => {
 // console.log('_getItemRasters :',  inum, geoItems, pars);
	let lprops = pars.properties,
		identityField = lprops.identityField,
		indexes = pars.tileAttributeIndexes,
		item = geoItems.values[inum],
		itemsbounds = geoItems.itemsbounds,
		// geo = pars.tiles,
		geo = item[item.length - 1],
		idr = item[indexes[identityField]],
		rcId = item[indexes.GMX_RasterCatalogID],
		tRange = pars.tRange;
let promArr = [];
let count = 0;
	for (let key in tRange.tHash) {
		const gtp = tRange.tHash[key];
		let bounds = itemsbounds[inum];
		if (!bounds) {
			bounds = Requests.geoItemBounds(geo);
			itemsbounds[inum] = bounds;
		}
		if (!gtp.bounds.intersects(bounds.bounds)) continue;
		const rUrl = _getUrlFunction({...gtp, rcId});
		if (requests[rUrl]) {
			promArr.push(requests[rUrl]);
			continue;
		}
		count++;
		const req = fetch(rUrl)
			.then(resp => {
				if (resp.status < 200 || resp.status >= 300) {						// error
					// tryHigherLevelTile(rUrl);
					return Promise.reject(resp);
				} else {
					return resp.blob();
				}
			})
			.then(createImageBitmap)
			.then(imageBitmap => {
				const canvas = _bitMapToRez(imageBitmap, {tilePoint: gtp, gtp});
				// if (rastersCache) rastersCache[key] = canvas;
				return {key, idr, gtp, iBounds: bounds.bounds, image: canvas};
				// resolve({gtp: gtp, gtp1: gtp, image: canvas});
			})
			.catch(() => {
				console.warn('skip:', gtp);
			});
		requests[rUrl] = req;
		promArr.push(req);
/**/
	}
	// console.warn('count:', count);
	return Promise.all(promArr).then(res => {
		let out = res.reduce((a, c) => {
			if (c) {
				let rit = a[c.idr] || {};
				rit[c.key] = c;
				a[c.idr] = rit;
			}
			return a;
		}, {});
		return Promise.resolve(out);
	});
};

// get tiles parameters for shifted object
const _getShiftTilesArray = (bounds, shiftX, shiftY) => {
	var mInPixel = this.topLeft.mInPixel,
		gmxTilePoint = this.gmxTilePoint,
		px = shiftX * mInPixel,
		py = shiftY * mInPixel,
		deltaX = Math.floor(0.5 + px % this.ts),            // shift on tile in pixel
		deltaY = Math.floor(0.5 + py % this.ts),
		tileSize = this.ts / mInPixel,
		tminX = gmxTilePoint.x - shiftX / tileSize,     // by screen tile
		tminY = gmxTilePoint.y - shiftY / tileSize,
		rminX = Math.floor(tminX),
		rmaxX = rminX + (tminX === rminX ? 0 : 1),
		rminY = Math.floor(tminY),
		rmaxY = rminY + (tminY === rminY ? 0 : 1),
		minX = Math.floor((bounds.min.x - shiftX) / tileSize),  // by geometry bounds
		maxX = Math.floor((bounds.max.x - shiftX) / tileSize),
		minY = Math.floor((bounds.min.y - shiftY) / tileSize),
		maxY = Math.floor((bounds.max.y - shiftY) / tileSize);

	if (rminX < minX) { rminX = minX; }
	if (rmaxX > maxX) { rmaxX = maxX; }
	if (rminY < minY) { rminY = minY; }
	if (rmaxY > maxY) { rmaxY = maxY; }

	var arr = [];
	for (var j = rminY; j <= rmaxY; j++) {
		for (var i = rminX; i <= rmaxX; i++) {
			arr.push({
				z: gmxTilePoint.z,
				x: i,
				y: j,
				dx: deltaX,
				dy: deltaY,
				tx: tminX,
				ty: tminY
			});
		}
	}
	return arr;
};

const _chkRastersByItemIntersect = (arr, iBounds) => {
	return arr.filter(it => Utils.getTileBounds(it).intersects(iBounds));
};

const _chkZoom = (zoom, ids) => {
	return	(zoom >= ids.minZoomRasters && 'rasterBGfunc' in ids) ||
			(zoom >= ids.minZoomQuicklooks && 'quicklookBGfunc' in ids);
};

const _loadTileRecursive = (tilePoint, item, ids) => {    //return promise, which resolves with object {gtp, image}
	let gtp = tilePoint;
	let rasterRequests = {};
	ids.badTiles = ids.badTiles || {};

	return new Promise((resolve) => {
		const tryLoad = (gtp, crossOrigin) => {
// console.log('tryLoad:', gtp);
			const rUrl = _getUrlFunction(gtp, item, ids);
			if (ids.rastersCache && ids.rastersCache[rUrl]) { // уже загружен
				resolve({gtp: tilePoint, gtp1: gtp, image: ids.rastersCache[rUrl]});
			} else {
				const tryHigherLevelTile = (url) => {
					if (url) ids.badTiles[url] = true;

					const z = gtp.z - 1;
					if (z && _chkZoom(z, ids)) {
						tryLoad({ x: Math.floor(gtp.x / 2), y: Math.floor(gtp.y / 2), z }, ''); // 'anonymous' 'use-credentials'
					} else {
						resolve({gtp: tilePoint, gtp1: gtp});
					}
				};

				if (ids.badTiles[rUrl] || (ids.maxNativeZoom && ids.maxNativeZoom < gtp.z)) {
					tryHigherLevelTile();
					return;
				}

				fetch(rUrl)
					.then(resp => {
						if (resp.status < 200 || resp.status >= 300) {						// error
							tryHigherLevelTile(rUrl);
							return Promise.reject(resp);
						} else {
							return resp.blob();
						}
					})
					.then(createImageBitmap)
					.then(imageBitmap => {
						const canvas = _bitMapToRez(imageBitmap, {tilePoint, gtp});
						if (ids.rastersCache) ids.rastersCache[rUrl] = canvas;
						resolve({gtp: tilePoint, gtp1: gtp, image: canvas});
					})
					.catch(() => {
						console.warn('skip:', gtp);
					});
			}
		};

		tryLoad(gtp);
	});
};
/*
const _getShiftPixels = (it) => {    // get pixels parameters for shifted object
	var w = it.dx + (it.dx < 0 ? 256 : 0),
		h = it.dy + (it.dy < 0 ? 256 : 0),
		sx = 0, sw = 256 - w, dx = w, dw = sw;
	if (it.tx > it.x) {
		sx = sw; sw = w; dx = 0; dw = sw;
	}
	if (sx === 256 || sw < 1) { return null; }

	var sy = h, sh = 256 - h, dy = 0, dh = sh;
	if (it.ty > it.y) {
		sy = 0; dy = sh; sh = h; dh = sh;
	}
	if (sy === 256 || sh < 1) { return null; }

	return {
		sx: sx, sy: sy, sw: sw, sh: sh,
		dx: dx, dy: dy, dw: dw, dh: dh
	};
};
*/
const getTilePosZoomDelta = (tilePoint, zoomFrom, zoomTo) => {		// получить смещение тайла на меньшем zoom
	const zDelta = Math.pow(2, zoomFrom - zoomTo),
		size = 256 / zDelta,
		x = size * (tilePoint.x % zDelta),
		y = size * (tilePoint.y % zDelta);
	return { size, zDelta, x, y };
};
    // default rasterHook: res - result canvas other parameters as http://www.w3schools.com/tags/canvas_drawimage.asp
const _defaultRasterHook = (res, image, sx, sy, sw, sh, dx, dy, dw, dh) => {
	if (image) res.getContext('2d').drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
	return res;
};

const _bitMapToRez = (imageBitmap, pars) => {
	const w = imageBitmap.width, h = imageBitmap.height;
	const canvas = new OffscreenCanvas(w, h);
	canvas.width = w; canvas.height = h;
	if (pars.tilePoint.z - pars.gtp.z) {
		let ps = getTilePosZoomDelta(pars.tilePoint, pars.tilePoint.z, pars.gtp.z);
		let sw = ps.size;
		if (sw < 1 / 256) return; // меньше 1px
		_defaultRasterHook(canvas, imageBitmap, ps.x, ps.y, sw, sw, 0, 0, 256, 256);
	} else {
		canvas.getContext('bitmaprenderer').transferFromImageBitmap(imageBitmap);
	}
	return canvas;
};
const _getUrlFunction = (pars) => {
	let srs = pars.srs || '3857';
	let hostName = pars.hostName || Utils.HOST,
		endPoint = pars.endPoint || '/TileSender.ashx',
		syncParams = pars.syncParams || '',
		url = '//' + hostName + endPoint + '?ModeKey=tile&ftc=osm' + '&x=' + pars.x + '&y=' + pars.y + '&z=' + pars.z;
	if (srs) url += '&srs=' + srs;
	url += '&LayerName=' + pars.rcId;
	if (pars.sessionKey) url += '&key=' + encodeURIComponent(pars.sessionKey);
	if (pars.syncParams) url += '&' + pars.syncParams;
	if (pars.v) url += '&v=' + pars.v;
	url += '&sw=1';
	return url;
};


export default {
	getNeedRasterItems,
};