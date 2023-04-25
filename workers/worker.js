import DataService from './src/DataService';
import MapsManager from './src/MapsManager';
import ChkVersion from './src/ChkVersion';
import gmxEventsManager from './src/gmxEventsManager';
// import Renderer2d from './src/Renderer2d';

onmessage = function(e) {
	const message = e.data || e;
	const pars = {...message};
// console.log('onmessage ', pars);
	switch(message.cmd) {
		case 'getTiles':
			const attr = message.attr;
			DataService.getTiles(pars).then(queues => {
	// console.log('getTiles ', message, pars, queues);
				// let out = [];
				let out = queues;
				let arr = queues.reduce((a, c) => {
					// delete c.tile;
					// c.items.forEach(it => {
						// delete it.observer;
						// delete it.itemData;

					// });
					// let bitmap = c.bitmap;
					// out.push({key: c.key, bitmap: c.bitmap});
					if (c.bitmap) a.push(c.bitmap);
					return a;
				}, []);
				postMessage({queues: out, z: attr.z, cmdNum: attr.cmdNum}, arr);
			});
			break;
		// case 'getTile':
			// DataService.getTile(pars).then(function(res) {
				// postMessage(res[0]);
			// });
			// break;
		case 'layeradd': 	MapsManager.addSource(pars);				break;
		case 'layerremove': MapsManager.removeSource(pars);				break;
		case 'getMap':		MapsManager.getMap(pars).then(postMessage); break;
		case 'moveend': 	ChkVersion.setBbox(pars.attr.mapPos);		break;
		case 'setDateIntervals': ChkVersion.setDateIntervals(pars);		break;
		case 'mousemove':
			let prom = gmxEventsManager.mousemove(pars);
			if (prom) prom.then(postMessage);
			break;
		default:
			if (DataService[message.cmd]) DataService[message.cmd].call(DataService, pars);
			else console.warn('skip ', message); 
			break;
	}
}
/*

const utils = {
	getFormBody: function(par) {
		return Object.keys(par).map(function(key) { return encodeURIComponent(key) + '=' + encodeURIComponent(par[key]); }).join('&');
	},
	chkResponse: function(resp, type) {
		if (resp.status < 200 || resp.status >= 300) {						// error
			return Promise.reject(resp);
		} else {
			var contentType = resp.headers.get('Content-Type');
			if (type === 'bitmap') {												// get blob
				return resp.blob();
			} else if (contentType.indexOf('application/json') > -1) {				// application/json; charset=utf-8
				return resp.json();
			} else if (contentType.indexOf('text/javascript') > -1) {	 			// text/javascript; charset=utf-8
				return resp.text();
			// } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
				// ret = resp.text();
			// } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
				// ret = resp.formData();
			// } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
				// ret = resp.arrayBuffer();
			// } else {
			}
		}
		return resp.text();
	},
}
const getMap = (MapName) => {
	// const MapName = mapId;
	const par = {
		WrapStyle: 'none',
		ModeKey: 'map',
		ftc: 'osm',
		skipTiles: 'All',
		srs: 3857,
		sw: 1,
		// key: '',
		MapName
	};
	const url = '//maps.kosmosnimki.ru/TileSender.ashx?' + utils.getFormBody(par);
	const opt = {
		method: 'get',
		// headers: {'Content-type': 'application/x-www-form-urlencoded'},
	// headers: {'Accept': 'application/json'},
	// body: JSON.stringify(params)	// TODO: сервер почему то не хочет работать так 
	};
	return fetch(url, opt)
	.then(res => res.json())
	.then(function(res) {
// console.log('gmxMap', res);
		return res;
		// return utils.chkResponse(res, options.type);
	})
}
*/