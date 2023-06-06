import './geomixer/index.js';
import viewer from './viewer/index.js';

L.gmx.viewer = viewer;

const mapId = L.gmxUtil.getLocSearch() || 'DefaultMap';
window.language = 'rus';
const MapInit = () => {
	const node = document.querySelector('#map');
	const map = new L.Map(node,
		{
			layers: [
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'})
			],
			// showPointsNum: false, // {skipLast: false, prefix: '', postfix: ''}
			drawOptions: {
				showPointsNum: {skipLast: false, prefix: 'вал ', postfix: ' м<tspan class="sup">3</tspan>'},
				// showPointsNum: false,<tspan style="font-weight: bold;">Жирный кот</tspan>
			},
			contextmenu: true,
			squareUnit: 'km2',
			distanceUnit: 'km',
			center: new L.LatLng(55.965056, 32.460908),
			attributionControl: false,
			zoomControl: false,
			minZoom: 1,
			zoom: 33
		}
	);

	const sendMapSize = () => {
		const zoom = map.getZoom(),
			bounds = map.getBounds(),
			topLeftMerc = L.CRS.EPSG3857.project(bounds.getNorthEast());
		map._topLeftMerc = topLeftMerc;
		let	mapPos = {
			bbox: L.gmxUtil.getBboxes(map, zoom, bounds),
			topLeftMerc,
			mapSize: map.getSize(),
			pBounds: map.getPixelBounds(),
			pOrigin: map.getPixelOrigin(),
			zoom
		};
		// console.log('mapPos', mapPos);
		L.gmx.vw._sendCmd({mapPos, cmd: 'moveend'});
	};
	const onMouseMove = (ev) => {
		if (_timerMouseMove) cancelAnimationFrame(_timerMouseMove);
		_timerMouseMove = requestAnimationFrame(hoverCheck.bind(this, ev), {timeout: 100});
		// hoverCheck(ev);
	};

	map
	.on('moveend resize', sendMapSize)
	.on('layeradd', (ev) => {
		// console.log('layeradd', ev);
		const layer = ev.layer;
		const id = layer.options.layerID;
		const _gmx = layer._gmx;
		if (id) {
			const data = {id};
			if (_gmx.beginDate && _gmx.endDate) {
				data.dateInterval = {
					begin: layer._gmx.beginDate.valueOf() /1000,
					end: layer._gmx.endDate.valueOf() /1000
				};
			}
			L.gmx.vw._sendCmd({...data, cmd: 'layeradd'} );
		}
	}).on('layerremove', (ev) => {
		const layer = ev.layer;
		const id = layer.options.layerID;
		if (id) {
			L.gmx.vw._sendCmd({id, cmd: 'layerremove'});
		}
	})
	.on('mousemove mouseover', onMouseMove, this);
	
	sendMapSize();
	// let gmxLayers = L.DomUtil.create('div', 'gmxLayers', map._container);

// map._gmxLayers = gmxLayers;
// map.createPane('gmxLayers');
	L.gmx.map = map;
	map.addControl(L.control.gmxZoom({}));
	map.addControl(L.control.gmxIcon({
			id: 'refresh-gif',
			regularImageUrl: '',
			title: 'Статус загрузки'
		})
		.on('statechange', function (ev) {
			console.log("active", ev);
		})
	);
	map.addControl(L.control.gmxHide());
/*
	map.addControl(L.control.gmxIcon({
			id: 'hide',
			svgSprite: true,
			activeIcon: true,
			// activeIcon: '-ttt',
			togglable: true,
			title: 'Печать'
		})
		.on('statechange', function (ev) {
			console.log("active", ev);
		})
	);
*/
	map.addControl(new L.Control.gmxDrawing({ id: 'drawing' }));
	map.addControl(L.control.gmxIcon({
			id: 'gmxprint',
			svgSprite: true,
			// togglable: true,
			title: 'Печать'
		})
		.on('click', function (ev) {
			// const target = ev.target;
			// const flag = target.options.isActive;
			const flag = true;
			const body = document.body;
			if (flag) body.classList.add('printMap');
			else body.classList.remove('printMap');

			console.log("active", flag);
		})
	);
	map.addControl(L.control.gmxCenter({}));
let c = L.control.gmxLocation({coordinatesFormat: 2});
c.setScaleFormat('text');
	console.log('gmxControlsManager', c);
	map.addControl(c);

/*
let c = map.gmxControlsManager.get('location');
c.setScaleFormat('text');
	const vwworker = L.gmx.vw;
	// const vwworker = L.gmx.vw;
	L.gmx.vw.onmessage = function(e) {
		const res = e.data;
		if (res.Status === 'ok') {
			L.gmxMap = new L.gmx.gmxMap(res.Result, commonOptions);
			L.gmxMap.leafletMap = map;

			viewerInit(map);
			map.addLayer(tLayer);

			// console.log('loadedMap', L.gmxMap);
		} else if (res.Status === 'error') {
			const errorInfo = res.ErrorInfo || {};
			console.warn(errorInfo.ErrorMessage, res.from);
		} else if (Array.isArray(res)) {
			res.forEach(it => {
				const zKey = it.zKey;
				
				if (tLayer.__promises[zKey]) tLayer.__promises[zKey](it);
				// if (this.__promises[zKey]) this.__promises[zKey].resolve(it.bitmap);
			});
		// } else if (res[0].bitmap) {
			// drawBitMap(res[0].bitmap);
		}
		console.log('vwworker received from worker', e.data);
	}
*/
/*
var CanvasLayer = L.GridLayer.extend({
	createTile: function(coords, done) {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x;
		tile.height = size.y;

		this.__createTile(coords, done, tile);
		return tile;
	},
	__createTile: function(coords, done, tile) {
		const key = this._tileCoordsToKey(coords);
		this.__promises = this.__promises || {};
		new Promise((resolve, reject) => {
			this.__promises[key] = resolve;
			L.gmx.vw.postMessage({
				cmd: 'getTiles',
				hostName: commonOptions.hostName,
				layerID: 'E7882FCE9E55484AB370D36CD7210648',
				queue: [coords],
				z: coords.z
			});
 		}).then(res => {
			  // console.log("Fulfilled: ", res);
				// const ctx = tile.getContext('bitmaprenderer');
				tile.getContext('bitmaprenderer').transferFromImageBitmap(res.bitmap);
				done('', tile);
			},
			error => {
				console.log("Rejected: ", error);
				done(error, tile);
			}
		  );
	}
});
var tLayer = new CanvasLayer();
*/
	// map.on('zoomend', ev => {
		// console.log('zoomend', ev);
		// L.gmx.vw.postMessage({
			// cmd: 'getTiles',
			// hostName: commonOptions.hostName,
			// layerID: 'E7882FCE9E55484AB370D36CD7210648',
			// queue: [{x:1, y:0, z:1}],
			// z: map.getZoom()
		// });
	// });
	
	// const drawBitMap = async bitmap => {
		// const canvas = document.createElement('canvas');
		// canvas.width = bitmap.width; // resize it to the size of our ImageBitmap
		// canvas.height = bitmap.height;
		
		// const ctx = canvas.getContext('bitmaprenderer'); // get a bitmaprenderer context
		// ctx.transferFromImageBitmap(bitmap);
		
		// const blob2 = await new Promise((res) => canvas.toBlob(res)); // get it back as a Blob
		// console.log(blob2); // Blob
		// const img = document.body.appendChild(new Image());
		// img.src = URL.createObjectURL(blob2);
	// }
const opt =	{
    // srs: 3857,
    // skipTiles: 'All',
    // hostName: 'maps.kosmosnimki.ru',
    // setZIndex: true,
    // isGeneralized: true,
    MapName: mapId,
    // ftc: 'osm'
};
L.gmx.gmxMapManager.getMap(opt).then(res => {
// L.gmx.vw._sendCmd('getMap', commonOptions).then(res => {
	// console.log('getMap res', res);
	// L.gmxMap = new L.gmx.gmxMap(res, commonOptions);
	// L.gmxMap.leafletMap = L.gmx.map;
	// L.gmxMap.addLayersToMap(L.gmx.map);

	viewer.init(L.gmx.map);
		// map.addLayer(tLayer);

});
// map._setViewerData = data => {
	// viewer.setData(data);
// };
// map._showContextMenu = data => {
	// viewer.showContextMenu(data);
// };
// map._showTableAttrs = data => {
	// viewer.showTableAttrs(data);
// };

let _timerMouseMove;
let lastHoverLayer;
// let gmx_id = '';
let _needSend = true;

const hoverCheck = (ev) => {
	const oEv = ev.originalEvent;
	const pars = {
		cmd: 'mousemove',
		ctrlKey: oEv.ctrlKey,
		altKey: oEv.altKey,
		shiftKey: oEv.shiftKey,
		latlng: ev.latlng,
		merc: L.Projection.SphericalMercator.project(ev.latlng.wrap()),
		layerPoint: ev.layerPoint
	};
	// if (ev.type === 'mouseover') map._lastCursor = '';
	
	L.gmx.vw._sendCmd(pars).then(res => {
		// console.log('mousemove res', res);
		let items = res.items;
		let cursor = 'grab';
		let hLayer = '';
		let repaint = false;
		let repaintLast = false;
		if (items.length) {
			let item = items[0],
				gmx_id = item.items[0].idr;
			cursor = 'pointer';
			hLayer = L.gmx.gmxMap.layersByID[item.layerID];
			if (lastHoverLayer && lastHoverLayer !== hLayer) {
				lastHoverLayer.clearHover();
				// if (gmx_id !== hLayer.options.hId) {
					map._lastCursor = '*';
				// }
			} else if (gmx_id !== hLayer.options.hId) {
				hLayer.setHover(gmx_id);
				map._lastCursor = '*';
			}
		} else if (lastHoverLayer) {
			if (lastHoverLayer.options.hId) map._lastCursor = '*';
			lastHoverLayer.clearHover();
			lastHoverLayer = undefined;
		}

		if (map._lastCursor !== cursor) {
			map._container.style.cursor = map._lastCursor = cursor;
			lastHoverLayer = hLayer;
		}
	});
};

let cont = map.gmxControlIconManager.get('refresh-gif')._container;
L.gmx._requests = {};
L.gmx.Requests = (pars) => {
	// console.log('Requests', pars);
	if (pars.remove) {
		delete L.gmx._requests[pars.url];
	} else {
		L.gmx._requests[pars.url] = pars;
	}
	if (Object.keys(L.gmx._requests).length) {
		cont.classList.add('active');
	} else {
		cont.classList.remove('active');
	}
};


}
export default MapInit;
