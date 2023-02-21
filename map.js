import './geomixer/index.js';
import viewerInit from './viewer/index.js';

const mapId = 'FEZ2G';

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
			squareUnit: 'km2',
			distanceUnit: 'km',
			center: new L.LatLng(55.965056, 32.460908),
			attributionControl: false,
			zoomControl: true,
			minZoom: 1,
			zoom: 33
		}
	);
	L.gmx.map = map;
	map.addControl(new L.Control.gmxDrawing({ id: 'drawing', svgSprite: true }));
	map.addControl(L.control.gmxIcon({
			id: 'gmxprint',
			svgSprite: true,
			togglable: true,
			title: 'User Button'
		})
		.on('statechange', function (ev) {
			// const target = ev.target;
			// const flag = target.options.isActive;
			const flag = true;
			const body = document.body;
			if (flag) body.classList.add('printMap');
			else body.classList.remove('printMap');

			console.log("active", flag);
		})
	);

/*
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
const opt =
	{
    "srs": 3857,
    "skipTiles": "All",
    "hostName": "maps.kosmosnimki.ru",
    "setZIndex": true,
    "isGeneralized": true,
    "MapName": mapId,
    "ftc": "osm"
};
L.gmx.gmxMapManager.getMap(opt).then(res => {
// L.gmx.vw._sendCmd('getMap', commonOptions).then(res => {
	console.log('getMap res', res);
	// L.gmxMap = new L.gmx.gmxMap(res, commonOptions);
	// L.gmxMap.leafletMap = L.gmx.map;
	// L.gmxMap.addLayersToMap(L.gmx.map);

	viewerInit(L.gmx.map);
		// map.addLayer(tLayer);

});
map.on('layeradd', (ev) => {
	// console.log('layeradd', ev);
	const layer = ev.layer;
	const id = layer.options.layerID;
	if (id) L.gmx.vw._sendCmd('layeradd', {id});
	// layer._map.panBy({x:0,y:1});
	// const bounds =L.gmxUtil.getGeometryBounds(layer._gmx.geometry).toLatLngBounds();
	// map.fitBounds(bounds);
}).on('layerremove', (ev) => {
	const layer = ev.layer;
	const id = layer.options.layerID;
	if (id) L.gmx.vw._sendCmd('layerremove', {id});
// }).on('click', (ev) => {
}).on('mousemove', (ev) => {
	const oEv = ev.originalEvent;
	const pars = {
		ctrlKey: oEv.ctrlKey,
		altKey: oEv.altKey,
		shiftKey: oEv.shiftKey,
		latlng: ev.latlng,
		merc: L.Projection.SphericalMercator.project(ev.latlng),
		layerPoint: ev.layerPoint
	};
	// pars.bbox = 
	// console.log('mousemove', pars);
	
	L.gmx.vw._sendCmd('mousemove', pars).then(res => {
		// console.log('mousemove res', res);
		let cursor = '';
		if (res.items) {
			cursor = 'pointer';
			// foundLayer = layer;
		}
		if (map._lastCursor !== cursor) {
			map._container.style.cursor = map._lastCursor = cursor;
		}
	});
});


}
export default MapInit;
