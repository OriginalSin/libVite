		console.log('qqqqqqq ');
onconnect = function(e) {
	const port = e.ports[0];
		console.log('hhhh ', e);
	port.onmessage = function(e) {
		const message = e.data || e;
		switch(message.cmd) {
			case 'getMap':
				getMap(message.mapId).then(function(res) {
					port.postMessage(res);
				})
				// getGmxMap(message).then(function(res) {
		// console.log('loadMap ', res, _self);
					// e.respondWith(res);
				// });

				break
			default:
		}
		console.log('in message ', message);
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
console.log('gmxMap', res);
		res.tt = 'klkl';
		return res;
		// return utils.chkResponse(res, options.type);
	})
}