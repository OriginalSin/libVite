import Utils from './Utils';
import Requests from './Requests';

const getNeedRasterItems = (obs) => {
 // console.log('_getNeedRasterItems :',  obs);
	if (!obs.items.length) return [];
	let	layerID = obs.layerID,
		ids = obs.layerData.ids,
		lData = obs.layerData.parseLayers.layersByID[layerID],
		lprops = ids.properties,
		identityField = lprops.identityField;
	if (!lprops.IsRasterCatalog) return [];

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

const w = 256, h = 256;
const canvas = new OffscreenCanvas(w, h);
canvas.width = w; canvas.height = h;
const _ctxTest = canvas.getContext('2d');
/**/
const _getVisibleItems = (geoItems, pars) => {
	if (geoItems.length < 2) {
		// this.itemsView = geoItems;
		// return geoItems;
	}

	let i, len,
		ts = 256,
		ctx = _ctxTest,
		scrTile = pars.scrTile,
		matrix = scrTile.matrix;

	ctx.clearRect(0, 0, ts, ts);
	ctx.imageSmoothingEnabled = false;
	for (i = 0, len = geoItems.length; i < len; i++) {
		ctx.fillStyle = Utils.dec2rgba(i + 1, 1);
		let geoItem = geoItems[i],
			paths = geoItem.itemData.paths;
		let fPath = new Path2D();
		paths.forEach(it => it.forEach(it2 => {
			if (it2[0]) fPath.addPath(it2[1], matrix);
		}));
		ctx.fill(fPath);
	}
	let items = {},
		data = ctx.getImageData(0, 0, ts, ts).data;

	for (i = 0, len = data.length; i < len; i += 4) {
		if (data[i + 3] === 255) {
			let color = data[i + 2];
			if (data[i + 1]) { color += (data[i + 1] << 8); }
			if (data[i]) { color += (data[i] << 16); }
			if (color) { items[color] = true; }
		}
	}
	let out = [];
	for (let num in items) {
		let it = geoItems[Number(num) - 1];
		if (it) {
			it.rasterPromises = _getItemRasters(it, pars);
			out.push(it);
		}
	}
	// this.itemsView = out;
 // console.log('_getVisibleItems :',  geoItems.length, out.length);
	return out;
/**/
};

const _getItemRasters = (geo, pars) => {
 // console.log('_getItemRasters :',  geo, pars);
	let itemData = geo.itemData,
		item = itemData.item,
		iBounds = itemData.bounds.bounds,
		layerID = itemData.layerID,
		ids = pars.layerData.ids,
		lData = pars.layerData.parseLayers.layersByID[layerID],
		lprops = lData.properties,
		identityField = lprops.identityField,
		indexes = geo.indexes,
		idr = item[indexes[identityField]],
	// if (!lprops.IsRasterCatalog) return [];
		// _this = this,

 ts = 255,
 gmx = {},
		// indexes = gmx.tileAttributeIndexes,
rasters = {},
		// rasters = this.rasters,
		// shiftX = Number(gmx.shiftXfield ? gmxAPIutils.getPropItem(gmx.shiftXfield, properties, indexes) : 0) % this.worldWidthMerc,
		// shiftY = Number(gmx.shiftYfield ? gmxAPIutils.getPropItem(gmx.shiftYfield, properties, indexes) : 0),
		// isShift = shiftX || shiftY,
isShift = false,
		// urlBG = gmxAPIutils.getPropItem('urlBG', properties, indexes),
		// url = '',
		itemImageProcessingHook = null,
		isTiles = false,
		// item = geo,
		// gmxTilePoint = this.gmxTilePoint,
		tilePoint = pars.coords,
		ntp = pars.coords,
		resCanvas = null;
geo.rasters = rasters;

	// item.v = geo.v;
	if (lprops.IsRasterCatalog && (lprops.type === 'Raster' || item[indexes.GMX_RasterCatalogID])) {
		isTiles = true;                     // Raster Layer
	} else if (gmx.quicklookBGfunc) {
		url = gmx.quicklookBGfunc(item);    // Quicklook
		itemImageProcessingHook = gmx.imageQuicklookProcessingHook;
	} else if (urlBG) {
		url = urlBG;                        // Image urlBG from properties
		itemImageProcessingHook = gmx.imageQuicklookProcessingHook;
	}
	if (isTiles) {
		return new Promise(resolve => {
			const dataOption = geo.itemData || {},
				tileToLoadPoints = _chkRastersByItemIntersect(isShift ? _getShiftTilesArray(dataOption.bounds, shiftX, shiftY) : [ntp], iBounds);

			let cnt = tileToLoadPoints.length;
			const chkReadyRasters = () => { if (cnt < 1) resolve(geo); },
				skipRasterFunc = () => { cnt--; chkReadyRasters(); },
				onLoadFunction = (gtp, p, img) => {
					item.skipRasters = false;
					let isImage = true;
geo.raster_ = img;
					if (itemImageProcessingHook) {
						img = itemImageProcessingHook(img, {
							gmx: gmx,
							geoItem: geo,
							item: item,
							gmxTilePoint: gtp
						});
						isImage = false;
					}

					var info = {
							geoItem: geo,
							image: img,
							zKey: gmx.zKey,
							destinationTilePoint: tilePoint,
							sourceTilePoint: gtp,
							sx: 0, sy: 0, sw: ts, sh: ts,
							dx: 0, dy: 0, dw: ts, dh: ts
						};

					if (isShift) {
						var pos = _getShiftPixels(p);
						if (pos === null) { skipRasterFunc(); return; }
						L.extend(info, pos);
						isImage = false;
					}

					if (gtp.z !== ntp.z) {
						var posInfo = getTilePosZoomDelta(ntp, ntp.z, gtp.z);
						if (posInfo.size < 1 / 256) {// меньше 1px
							chkReadyRasters();
							return;
						}
						isImage = false;
						info.sx = Math.floor(posInfo.x);
						info.sy = Math.floor(posInfo.y);
						info.sw = info.sh = posInfo.size;
						if (isShift) {
							let sw = Math.floor(info.dw / posInfo.zDelta);
							info.sx = (info.dx === 0 ? info.sw : ts) - sw;
							info.sw = sw;

							let sh = Math.floor(info.dh / posInfo.zDelta);
							info.sy = (info.dy === 0 ? info.sh : ts) - sh;
							info.sh = sh;
						}
					}
					if (isImage && !gmx.rasterProcessingHook) {
						cnt--;
						resCanvas = img;
						rasters[idr] = resCanvas;
						chkReadyRasters();
					} else {
						if (!resCanvas) resCanvas = img;
						info.res = resCanvas;
						chkReadyRasters();
/*
						var hookResult = _rasterHook(info),
							then = function() {
								cnt--;
								//p.resImage = resCanvas;
								rasters[idr] = resCanvas;
								chkReadyRasters();
							};

						if (hookResult) {
							if (hookResult.then) {
								hookResult.then(then);
							} else {
								resCanvas = hookResult;
								then();
							}
						} else if (hookResult === null) {
							item.skipRasters = true;
							skipRasterFunc();
						} else {
							resCanvas = img;
							then();
						}
*/
					}
				};
			if (cnt) {
				tileToLoadPoints.forEach(it => {
					_loadTileRecursive(it, item, ids).then(res => {
						onLoadFunction(res.gtp, it, res.image);
					}, skipRasterFunc);
				});
			} else {
				item.skipRasters = true;
				skipRasterFunc();
			}
		});
	}
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
const _getUrlFunction = (gtp, item, gmx) => {
	return gmx.rasterBGfunc(gtp.x, gtp.y, gtp.z, item);
};

export default {
	getNeedRasterItems,
};