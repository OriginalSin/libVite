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
			center: new L.LatLng(50, 20),
			attributionControl: false,
			zoomControl: true,
			zoom: 3
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
const commonOptions =
	{
    "srs": 3857,
    "skipTiles": "All",
    "hostName": "maps.kosmosnimki.ru",
    "setZIndex": true,
    "isGeneralized": true,
    "MapName": mapId,
    "ftc": "osm"
};
	const vwworker = L.gmx.vw;
	vwworker.onmessage = function(e) {
		const res = e.data;
		if (res.Status === 'ok') {
			L.gmxMap = new L.gmx.gmxMap(res.Result, commonOptions);
			L.gmxMap.leafletMap = map;

			viewerInit(map);
			console.log('loadedMap', L.gmxMap);
		} else if (res.Status === 'error') {
			const errorInfo = res.ErrorInfo || {};
			console.warn(errorInfo.ErrorMessage, res.from);
		} else if (res[0].bitmap) {
			drawBitMap(res[0].bitmap);
		}
		console.log('vwworker received from worker', e.data);
	}
	vwworker.postMessage({cmd: 'getMap', ...commonOptions});
	/*
	
	let hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		z = message.z,
		hostLayers = hosts[hostName];

	const shworker = L.gmx.shw;
	shworker.port.onmessage = function(e) {
	viewerInit(map, e.data);
		console.log('shworker received from worker', e.data);
		console.log(e.lastEventId);
	}
		shworker.port.postMessage({cmd: 'getMap', mapId});
	*/
	map.on('zoomend', ev => {
		console.log('zoomend', ev);
		vwworker.postMessage({
			cmd: 'getTiles',
			hostName: commonOptions.hostName,
			layerID: 'E7882FCE9E55484AB370D36CD7210648',
			queue: [{x:1, y:0, z:1}],
			z: map.getZoom()
		});
	});
	
	const drawBitMap = async bitmap => {
		const canvas = document.createElement('canvas');
		// resize it to the size of our ImageBitmap
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		// get a bitmaprenderer context
		const ctx = canvas.getContext('bitmaprenderer');
		ctx.transferFromImageBitmap(bitmap);
		// get it back as a Blob
		const blob2 = await new Promise((res) => canvas.toBlob(res));
		console.log(blob2); // Blob
		const img = document.body.appendChild(new Image());
		img.src = URL.createObjectURL(blob2);
	}
}
export default MapInit;
