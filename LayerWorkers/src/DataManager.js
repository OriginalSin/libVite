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
	// dateInterval = {},
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
const drawLayer = async (data, resolve) => {
	// const pz = _parseTileRange(data);
	const h2 = Math.pow(2, data.zoom + 7);
	const mInPixel = 2 * h2 / Utils.WORLDWIDTHFULL;
	// const mInPixel = Math.pow(2, data.zoom + 8) / Utils.WORLDWIDTHFULL;
	const matrix = new DOMMatrix([mInPixel, 0, 0, mInPixel, h2 - pBounds.min.x, h2 - pBounds.min.y]);

	let canvas;
	if (mapSize && (!canvas || mapSize.x !== canvas.width || mapSize.y !== canvas.height)) {
		const w = mapSize.x, h = mapSize.y;
		canvas = new OffscreenCanvas(w, h);
		canvas.width = w; canvas.height = h;
	}
	const tRange = _parseTileRange(data);
	let rasters;
	if (properties.IsRasterCatalog) {
		rasters = await RasterItems.getNeedRasterItems({tiles, tileAttributeIndexes, properties, tRange, mapSize, canvas, matrix});
	}
// console.log('drawLayer1', rasters);

	let identityField = properties.identityField;
	let notEmpty = false;
	tiles.forEach(it => {
		let itemsbounds = it.itemsbounds;
		it.paths.forEach((it1, i) => {
			let iProps = it.values[i];
			let bounds = itemsbounds[i];
			let geo = iProps[iProps.length - 1];
			if (!bounds) {
				bounds = Requests.geoItemBounds(geo);
				itemsbounds[i] = bounds;
			}
			if (!bounds.bounds.intersects(bboxBounds)) return;
// if (iProps[1] !== 'S2A_2023-05-20_071330_41TME') return;

			let idr = iProps[tileAttributeIndexes[identityField]];
// if (idr !== 306851) return;
			let images = rasters[idr];
			notEmpty = true;
			Renderer2d.updatePolyMerc({paths: it1, images, canvas, matrix});
		});
	});
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
	if (!properties) {
		geometry = data.origin.geometry;
		properties = data.origin.properties;
		let tmp = Utils.getTileAttributes(properties);
		tileAttributeIndexes = tmp.tileAttributeIndexes;
		tileAttributeTypes = tmp.tileAttributeTypes;
		// identityField = properties.identityField,

		styles = await Utils.parseStyles(properties);
	}
	tiles = await TilesLoader.load(data);

	bboxBounds = data.bboxBounds;
	mapSize = data.mapSize;
	pOrigin = data.pOrigin;
	pBounds = data.pBounds;
	let rasters;
	if (drawScreenCom) {
		// const tRange = _parseTileRange(drawScreenCom);
		// if (properties.IsRasterCatalog) rasters = await RasterItems.getNeedRasterItems({tiles, tileAttributeIndexes, tRange});
// console.log('version1', mapSize, pBounds.min.x - pOrigin.x, styles, tiles, rasters);
		drawLayer(drawScreenCom, drawScreenCom.resolver);
	}

// console.log('version', mapSize, pBounds.min.x - pOrigin.x, styles, tiles, rasters);
	return new Promise(resolve => {
		const cmdNum = data.cmdNum;
		data.tilesPromise = tiles;
			resolve({cmdNum, tilesCount: tiles.length});
/*
			// console.log('___ tiles _____:', drawScreenCom, tiles);
		versionPromise = TilesLoader.load(data).then(res => {
			tiles = res.tiles;			// загрузили все нужные тайлы
			if (drawScreenCom) drawLayer(drawScreenCom, drawScreenCom.resolver);
			versionPromise = null;
			resolve({cmdNum, tilesCount: tiles.length});
		});
		*/
	});
};
const drawScreen = (data) => {
	return new Promise(resolve => {
		const cmdNum = data.cmdNum;
		// if (versionPromise || !tiles) {
			data.resolver = resolve;
			drawScreenCom = data;
		// } else {
			// drawLayer(data, resolve);
		// TilesLoader.load(data).then(arr => {
			// tiles = arr;			// загрузили все нужные тайлы
			// console.log('___ tiles _____:', tiles);
		// });
		// }
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