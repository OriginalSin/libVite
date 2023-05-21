import Utils from './Utils';
import Requests from './Requests';
import Store from './Store';
import TilesLoader from './TilesLoader';
import RasterItems from './RasterItems';
import Renderer2d from './Renderer2d';
// import Observer from './Observer';

// let hosts = {},
let	hover = {},
    tiles,
    geometry,
    properties,
	tileAttributeIndexes,
	tileAttributeTypes,
	styles,
	versionPromise,
	drawScreenCom,
	dateInterval = {},
	filters = [
		(arr) => {
			if (properties.TemporalColumnName) {
				let tmp = arr[tileAttributeIndexes[properties.TemporalColumnName]];
// console.log('filters dateInterval', new Date(dateInterval.begin * 1000).toISOString(), tmp, new Date(dateInterval.end * 1000).toISOString());
				if (dateInterval.begin > tmp || dateInterval.end < tmp) return false;
				// if (dateInterval.begin > tmp || dateInterval.end < tmp) {
				// return false; }
			}
			return true;
		}
	],
    // bbox = null,
mapSize,
bboxBounds,
pOrigin,
pBounds,
zoom,
	_ctxLabels;
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}
const _parseTileRange = (data) => {
	const tileRange = data.tileRange;
	const zoom = data.zoom;
	const queue = [];
	const tHash = {};

	const pz = Math.pow(2, zoom);
	for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
		for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
			const real = {
				z: zoom,
				x: i % pz + (i < 0 ? pz : 0),
				y: j % pz + (j < 0 ? pz : 0)
			};
			real.bounds = Utils.getTileBounds(real);
			real.shiftPixels = {
				x: real.x * 256 - pBounds.min.x,
				y: real.y * 256 - pBounds.min.y
			};

			const rKey = real.x + ':' + real.y + ':' + zoom;
			tHash[rKey] = real;
			queue.push({x: i, y: j, z: zoom});
			
		}
	}
	return {tHash, queue};
}
const chkFilters = (data) => {
	let flag = true;
	for (let i = 0, len = filters.length; i < len; i++) {
		if (!filters[i](data)) return false;
	}
	return true;
}
const drawLayer = async (data, resolve) => {
	const zoom = data.zoom;
	const h2 = Math.pow(2, zoom + 7);
	const mInPixel = 2 * h2 / Utils.WORLDWIDTHFULL;
	const matrix = new DOMMatrix([mInPixel, 0, 0, mInPixel, h2 - pBounds.min.x, h2 - pBounds.min.y]);

	let canvas;
	if (mapSize && (!canvas || mapSize.x !== canvas.width || mapSize.y !== canvas.height)) {
		const w = mapSize.x, h = mapSize.y;
		canvas = new OffscreenCanvas(w, h);
		canvas.width = w; canvas.height = h;
	}
	const tRange = _parseTileRange(data);
	let rasters = [];
	let IsRasterCatalog = properties.IsRasterCatalog;
	if (IsRasterCatalog) {
		rasters = await RasterItems.getNeedRasterItems({tiles, tileAttributeIndexes, properties, tRange, mapSize, canvas, matrix});
	}
console.log('drawLayer1', dateInterval);

	let identityField = properties.identityField;
	let notEmpty = false;
	let rArr = [];
	tiles.forEach(it => {
		let itemsbounds = it.itemsbounds;
		let itemsStyleNums = it.itemsStyleNums || [];
		it.paths.forEach((it1, i) => {
			let item = it.values[i];
			if (!chkFilters(item)) return;

			let bounds = itemsbounds[i];
			let geo = item[item.length - 1];
			if (!bounds) {
				bounds = Requests.geoItemBounds(geo);
				itemsbounds[i] = bounds;
			}
			if (!bounds.bounds.intersects(bboxBounds)) return;

			let idr = item[tileAttributeIndexes[identityField]];
			let st = itemsStyleNums[i];
			if (st === undefined) {
				st = Utils.getStyleNum(item, styles, tileAttributeIndexes, zoom);
				itemsStyleNums[i] = st;
				it.itemsStyleNums = itemsStyleNums;
			}

// if (idr !== 306851) return;
			let images = rasters[idr];
			notEmpty = true;
			rArr.push({idr, IsRasterCatalog, styles: styles[st], paths: it1, images, canvas, matrix});
			// Renderer2d.updatePolyMerc({paths: it1, images, canvas, matrix});
		});
	});
	rArr.sort((a, b) => a.idr - b.idr).forEach(it => Renderer2d.updatePolyMerc(it));
	delete data.resolver;
	drawScreenCom = undefined;
	let bitmap = notEmpty ? canvas.transferToImageBitmap() : null;
	resolve({...data, bitmap});
};
/*
const initLayer = (data) => {
	geometry = data.origin.geometry;
	properties = data.origin.properties;
	return Utils.parseStyles(properties);
	// styles = await Utils.parseStyles(properties);
	// .then(st => {
// console.log('stylesPromise', st, properties);
	// });
// console.log('initLayer', styles);
};
*/
const version = async (data) => {
	const origin = data.origin;
	if (!properties) {
		geometry = origin.geometry;
		properties = origin.properties;
		let tmp = Utils.getTileAttributes(properties);
		tileAttributeIndexes = tmp.tileAttributeIndexes;
		tileAttributeTypes = tmp.tileAttributeTypes;
		// identityField = properties.identityField,

		styles = await Utils.parseStyles(properties);
	}
	dateInterval = origin.dateInterval;
	tiles = await TilesLoader.load(data);

	bboxBounds = data.bboxBounds;
	mapSize = data.mapSize;
	pOrigin = data.pOrigin;
	pBounds = data.pBounds;
	let rasters;
	if (drawScreenCom) {
// console.log('version1', mapSize, pBounds.min.x - pOrigin.x, styles, tiles, rasters);
		drawLayer(drawScreenCom, drawScreenCom.resolver);
	}

// console.log('version', mapSize, pBounds.min.x - pOrigin.x, styles, tiles, rasters);
	return new Promise(resolve => {
		const cmdNum = data.cmdNum;
		data.tilesPromise = tiles;
			resolve({cmdNum, tilesCount: tiles.length});
	});
};
const drawScreen = (data) => {
	return new Promise(resolve => {
		// const cmdNum = data.cmdNum;
		data.resolver = resolve;
		drawScreenCom = data;
	});
};

export default {
	drawScreen,				// нужна отрисовка
	version,				// получили список тайлов для загрузки
	// setDateInterval,
	// sortLayersData,
	// setHover,
	// getTile,
	// getTiles,
	// drawItem,
	// drawLabels
};