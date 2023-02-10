import Requests from './src/Requests.js';
import DataVersion from './src/DataSourceVersion';
import Renderer2d from './src/Renderer2d';

onmessage = function(e) {
	const message = e.data || e;
	const pars = {...message};
	console.log('onmessage ', pars);
	switch(message.cmd) {
		case 'getTile':
			DataVersion.getTile(pars).then(function(res) {
				postMessage(res[0]);
			});
			break;
		case 'layeradd':
			DataVersion.addSource(pars);
			break;
		case 'layerremove':
			DataVersion.removeSource(pars);
			break;
		case 'getMap':
			DataVersion.getMap(pars).then(postMessage);
			break;
		// case 'getMap':
			// DataVersion.getMapTree({mapID: message.mapId, apiKey: message.apiKey, hostName: message.hostName, search: message.search}).then((json) => {
				// message.out = json;
				// postMessage(message);
			// });
			// break;
		// case 'getTiles':
			// DataVersion.getTiles(pars).then(function(res) {
				// postMessage(res);
			// });
			// break;
		default:
			break;
	}
}
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