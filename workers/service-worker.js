const SW_VERSION = '%SW_VERSION%'  // it will be replaced on each build, and only fixed string "dev" in development

var _self = self;
/*
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(async function () {
    await self.clients.claim()
    console.log('SW activated', SW_VERSION, self.addEventListener)
	// (self.on || self.addEventListener).call(self, 'message', e => {
		// const message = e.data || e;
		// console.log('in message ', e);
	// });
  }())
})
self.addEventListener('fetch', event => {
	console.log('fetch ',event);
  // event.respondWith(
    // caches.match(event.request)
  // );
})
self.addEventListener('message', e => {
	const message = e.data || e;
	const cmd = e.data || e;
	switch(message.cmd) {
        case 'loadMap':
			// getGmxMap(message).then(function(res) {
	// console.log('loadMap ', res, _self);
				// e.respondWith(res);
			// });

			break
        default:
	}
	console.log('in message ', message);
});
*/
var CACHE_NAME = 'Geomixer';
var OFFLINE_TILE = './offline.png';
var offlineVersion = false;

console.log("SW startup");

self.addEventListener('install', function(event) {
  // Store the «offline tile» on startup.
  return fetchAndCache(OFFLINE_TILE)
    .then(function () {
      console.log("SW installed");
    });
});

self.addEventListener('activate', function(event) {
  console.log("SW activated");
});

self.addEventListener('message', function(event) {
  var data = event.data;
  if ('offlineVersion' in data) {
	offlineVersion = data.offlineVersion;
  }
  console.log("SW message", data);
});

//
// Intercept download of map tiles: read from cache or download.
//
self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (/\bsw=1\b/.test(request.url)) {
    var cached = caches.match(request)
      .then(function (r) {
        if (r) {
          // console.log('Cache hit', r);
          return r;
        }
        // console.log('Cache missed', request);
        return offlineVersion ? null : fetchAndCache(request);
      })
      // Fallback to offline tile if never cached.
      .catch(function(e) {
        console.log('Fetch failed', e);
        return fetch(OFFLINE_TILE);
      });
    event.respondWith(cached);
  }
});
//
// Helper to fetch and store in cache.
//
function fetchAndCache(request) {
  return fetch(request)
    .then(function (response) {
	  if (response.status === 404) {
		  return response;
	  } else {
		  return caches.open(CACHE_NAME)
			.then(function(cache) {
			  // console.log('Store in cache', response);
			  cache.put(request, response.clone());
			  return response;
			});
	  }
    });
}

//	http://prgssr.ru/development/sozdaem-service-worker.html
//	http://almet.github.io/kinto-geophotos/

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

const getGmxMap = (message) => {
	const url = '//maps.kosmosnimki.ru/TileSender.ashx';
	const MapName = message.mapId;
	const par = {
		WrapStyle: 'none',
		ModeKey: 'map',
		ftc: 'osm',
		skipTiles: 'All',
		srs: 3857,
		// key: '',
		MapName
	};
	const opt = {
		method: 'post',
		headers: {'Content-type': 'application/x-www-form-urlencoded'},
		body: utils.getFormBody(par)
	};
	return fetch(url, opt)
	.then(function(res) {
		return utils.chkResponse(res, options.type);
	})
	.then(function(res) {
		return {message, load: true, res: res};
	})
	.catch(function(err) {
		return {message, load: false, error: err.toString()};
		// handler.workerContext.postMessage(out);
	});
	/*
	L.gmx.loadMap(mapId, {
		// leafletMap: map,
		hostName: '/',
		setZIndex: true,
		disableCache: true,
		// gmxEndPoints: gmxEndPoints
	}).then(res => {
		// gmxMap = res;
	console.log('gmxMap', res);
	});
	*/
}
