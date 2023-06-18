
var newStyles = Boolean(window.location.search.match(/newStyles=true/ig));

var mapsSite = true;
var protocol = window.location.protocol;
//protocol = 'https:';
var gmxAuthServer = protocol + '//my.kosmosnimki.ru/';
// window.gmxSkipTiles = 'NotVisible';  // в описании основной карты НЕ выдавать списки тайлов для не видимых слоев
// window.isGeneralized = false;    	// По умолчанию генерализация включена для всех слоев

//var gmxJSHost = protocol + '//maps.kosmosnimki.ru/api/';
var serverBase = protocol + '//maps.kosmosnimki.ru/';
// var serverBase = window.location.protocol + '//192.168.7.216:85/';
// let module = './gmxPlugins.jsx';
// let module = 'gmxPlugins';
// let gmxPlugins;
import gmxPlugins from './config/gmxPlugins.js';
import dynamic from './config/dynamic.js';
window.gmx = {
	dynamic,
	gmxPlugins
};
// const gmxPlugins = (await import(`./modules/${module}.js`)).default;
// console.log('gmxPlugins1', window.gmx);



// const modules = import.meta.glob('./modules/*.js')
    // console.log('modules',modules)
// for (const path in modules) {
  // modules[path]().then((mod) => {
    // if (path === './modules/gmxPlugins.js') gmxPlugins = mod.default;
    // console.log('gmxPlugins1', path, mod)
  // })
// }
// let gmxPlugins = await import(/* @vite-ignore */`./modules/${module}.jsx`);
// import gmxPlugins from './gmxPlugins.jsx';
// console.log('gmxPlugins1', gmxPlugins);

var iconPrefix = protocol + '//maps.kosmosnimki.ru/api/img/baseLayers/';
// var baseMap = {
	// hostName: false,
	// id: '1D30C72D02914C5FB90D1D448159CAB6',
	// mapLayerID: '072445C1542B4CF088B2D47D675E47AC',
	// satelliteLayerID: 'C9458F2DCB754CEEACC54216C7D1EB0A'
	// ,
	// additionalTileLayers: [
		// {
			// id: 'map',
			// rus: 'Карта RuMap',
			// eng: 'RuMap',
			// icon: iconPrefix + 'basemap_rumap.png',
			// layers: [
				// {
					// urlTemplate: 'http://tile.digimap.ru/rumap/{z}/{x}/{y}.png',
					// maxNativeZoom: 20
				// }
			// ]
		// },
		// {
			// id: 'OSM',
			// rus: 'Карта',
			// eng: 'Map',
			// icon: iconPrefix + 'basemap_rumap.png',
			// layers: [
				// {
					// urlTemplate: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
					// maxZoom: 18,
					// attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
				// }
			// ]
		// }
	// ]
// };

var gmxGeoCodeUseOSM = true;
// настройки карты
var mapOptions = {
	// allWorld: true,		// chkVersion по всему миру
	skipTiles: 'All',
	srs: '3857',
	iconsUrlReplace: [
		{ from: '../GetImage.ashx', to: serverBase + 'GetImage.ashx' }
	],
	//svgSprite: 'leaflet/plugins/gmxControls/dist/css/img/svg-symbols.svg',
	//svgSprite: true,
	maxPopupCount: 10
};
// var gmxVersion = {
  // "jsPath": {
    // "//www.kosmosnimki.ru/lib/geomixer_1.3/geomixer-src.js": 1508146119421
  // },
  // "cssPath": {
    // "//www.kosmosnimki.ru/lib/geomixer_1.3/geomixer.css": 1508146119421
  // }
// };
var gmxVersion = {
  "jsPath": {
    "//localhost:8030/api5/leaflet/geomixer-src-chkVer.js": 1508146119421
  },
  "cssPath": {
    "//localhost:8030/api5/leaflet/geomixer.css": 1508146119421
  }
};

// if (window.location.search.match('svgIcons=true')) {
	// mapOptions.svgSprite = 'leaflet/plugins/gmxControls/dist/css/img/svg-symbols.svg';
// }
var controlsOptions = {
	gmxLoaderStatus: {type: 'font'}
	// gmxDrawing: {items: ['Rectangle', 'Polyline', 'Point', 'Polygon']},
	// gmxLocation: {scaleFormat: 'text'},
	// gmxCopyright: {cursorPosition: true}
	// ,
	// gmxHide: {isActive: false}
	//gmxLogo: null
};
// nsGmx._defaultPlugins =

