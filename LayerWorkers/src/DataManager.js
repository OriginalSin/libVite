import Utils from './Utils';
import Requests from './Requests';
import Store from './Store';
import TilesLoader from './TilesLoader';
import RasterItems from './RasterItems';
import Renderer2d from './Renderer2d';
// import Observer from './Observer';

// let hosts = {},
let	hover = {},
    tiles = [],
    geometry,
    properties,
	tileAttributeIndexes,
	tileAttributeTypes,
	styles,
	versionPromise,
	drawScreenCom,
	dateInterval = {},
	filterTypes = {
		dateInterval: (arr) => {
			if (properties.TemporalColumnName) {
				let tmp = arr[tileAttributeIndexes[properties.TemporalColumnName]];
// console.log('filters dateInterval', new Date(dateInterval.begin * 1000).toISOString(), tmp, new Date(dateInterval.end * 1000).toISOString());
				if (dateInterval.begin > tmp || dateInterval.end < tmp) return false;
			}
			return true;
		},
		hover: (arr, pars) => {
			let ib = pars.bounds;
			return Utils.chkHoverItem(arr[arr.length - 1], ib.boundsArr, pars.merc, ib.bounds);
		},
	},
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
const chkFilters = (filters, data, dp) => {
	let flag = true;
	for (let i = 0, len = filters.length; i < len; i++) {
		if (!filters[i](data, dp)) return false;
	}
	return true;
}
const getItems = (pars) => {
	let filters = [filterTypes.dateInterval];
	let skipDraw = false;
	if (pars.cmd === 'mousemove') {
		skipDraw = true;
		filters.push(filterTypes.hover);
	}
	
	const IsRasterCatalog = properties.IsRasterCatalog;
	const rArr = [];
	tiles.forEach(it => {
		const itemsbounds = it.itemsbounds;
		const itemsStyleNums = it.itemsStyleNums || [];
		it.paths.forEach((it1, i) => {
			const item = it.values[i];

			let bounds = itemsbounds[i];
			if (!bounds) {
				bounds = Requests.geoItemBounds(item[item.length - 1]);
				itemsbounds[i] = bounds;
			}
			if (!bounds.bounds.intersects(bboxBounds)) return;
			if (!chkFilters(filters, item, {...pars, bounds})) return;

			const idr = item[tileAttributeIndexes[properties.identityField]];
			let num = itemsStyleNums[i];
			if (num === undefined) {
				num = Utils.getStyleNum(item, styles, tileAttributeIndexes, zoom);
				itemsStyleNums[i] = num;
				it.itemsStyleNums = itemsStyleNums;
			}

			let pt = {idr, item, IsRasterCatalog};
			if (!skipDraw) pt = {...pt, styles: styles[num], paths: it1, images: pars.rasters[idr], canvas: pars.canvas, matrix: pars.matrix};
			rArr.push(pt);
		});
	});
	return rArr;
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
	let rasters = [];
	if (properties.IsRasterCatalog) {
		rasters = await RasterItems.getNeedRasterItems({tiles, tileAttributeIndexes, properties, tRange: _parseTileRange(data), mapSize, canvas, matrix});
	}
console.log('drawLayer1', rasters);

	const rArr = getItems({ canvas, rasters, matrix });
	rArr.sort((a, b) => a.idr - b.idr).forEach(it => Renderer2d.updatePolyMerc(it));
	delete data.resolver;
	drawScreenCom = undefined;
	const bitmap = rArr.length ? canvas.transferToImageBitmap() : null;
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
const mousemove = (data) => {
	return new Promise(resolve => {
		const cmdNum = data.cmdNum;
		const items = getItems(data);

		resolve({cmdNum, items});
	});
};

export default {
	drawScreen,				// нужна отрисовка
	version,				// получили список тайлов для загрузки
	mousemove,				// поиск объектов
	// sortLayersData,
	// setHover,
	// getTile,
	// getTiles,
	// drawItem,
	// drawLabels
};