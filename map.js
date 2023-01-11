import './lib/main.js'

const node = document.querySelector('#map');
// node.classList.add('activeIconSidebar');
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
		zoomControl: true,
		zoom: 3
	}
);
map.addControl(new L.Control.gmxDrawing({ id: 'drawing' }));

/*
const mapId = 'FEZ2G';
L.gmx.loadMap(mapId, {
	// leafletMap: map,
	hostName: '/',
	setZIndex: true,
	disableCache: true,
	// gmxEndPoints: gmxEndPoints
}).then(gmxMap => {
	const mprops = gmxMap.properties || {};
	const mbounds = L.latLngBounds([mprops.MinViewY || 57, mprops.MinViewX || 22], [mprops.MaxViewY || 68, mprops.MaxViewX || 58]);
	map.setMaxBounds(mbounds);
	map.setMinZoom(mprops.MinZoom || 6);
	map.invalidateSize();
	map.options.distanceUnit = mprops.DistanceUnit;
	map.options.squareUnit = mprops.SquareUnit;
	// map.options._gmxEndPoints = gmxEndPoints;
});
*/
export default map;
