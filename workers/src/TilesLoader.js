import Requests from './Requests';

const TILE_PREFIX = 'gmxAPI._vectorTileReceiver(';
const edgeLimit = 0.05;

const chkLimit = (x1, x2, b) => {
	return Math.abs(x1 - b) < edgeLimit && Math.abs(x2 - b) < edgeLimit;
};
const chkOnEdge = (p1, p2, ext) => { // отрезок на границе
	return (
		(chkLimit(p1[0], p2[0], ext.min.x) || chkLimit(p1[0], p2[0], ext.max.x)) ||
		(chkLimit(p1[1], p2[1], ext.min.y) || chkLimit(p1[1], p2[1], ext.max.y))
	);
};

const parseValues = (json) => {
	const tb = Requests.bounds(json.bbox);
	json.bounds = tb;

	const hiddenLines = [];
	json.values.forEach(it => {
		const geo = it[it.length - 1];

		const type = geo.type;
		const coords = geo.coordinates;
		if (type === 'MULTIPOLYGON') {
			let hr = coords.map(it => {
				return it.map(it1 => {return getHidden(it1, tb)})
			});
			hiddenLines.push(hr);
		}
		if (type === 'POLYGON') {
			let hr = coords.map(it => {return getHidden(it, tb)});
			hiddenLines.push(hr);
		}
	});
	json.hiddenLines = hiddenLines;
	// console.log('hiddenLines', json);
};

const getHidden = (ring, tb) => {  // массив точек на границах тайлов
	let prev = null;
	return ring.reduce((p, c, i) => {
		if (prev && chkOnEdge(c, prev, tb)) p.push(i);
		prev = c;
		return p;
	}, []);
};

const load = (pars) => {
	pars = pars || {};
	if (!pars.signals) { pars.signals = {}; }
	if (!pars.tilesPromise) { pars.tilesPromise = {}; }
	
	// return new Promise((resolve) => {
		let tilesOrder = pars.tilesOrder,
			pb = pars.tiles,
			tilesPromise = {};
		for (let i = 0, len = pb.length; i < len; i += tilesOrder.length) {
			let arr = pb.slice(i, i + tilesOrder.length),
				tkey = arr.join('_'),
				tHash = tilesOrder.reduce((p, c, j) => { p[c] = arr[j]; return p; }, {});

			if (pars.tilesPromise[tkey]) {
				tilesPromise[tkey] = pars.tilesPromise[tkey];
			} else {
				// pars.tilesPromise[tkey] = Requests.getTileJson({
				tilesPromise[tkey] = Requests.getTileJson({
					url: '//' + pars.hostName + '/TileSender.ashx',
					options: Requests.chkSignal(tkey, pars.signals),
					paramsArr: [tHash, {
						r: 'j',
						ModeKey: 'tile',
						LayerName: pars.id,
					}]
				}).then(json => {
					delete pars.signals[tkey];
					if (typeof(json) === 'string') {
						if (json.substr(0, TILE_PREFIX.length) === TILE_PREFIX) {
							json = json.replace(TILE_PREFIX, '');
							json = JSON.parse(json.substr(0, json.length -1));
						}
					}
					parseValues(json);
					console.log('json', json);
					return json;
				})
				.catch(err => {
					console.error(err);
				})
			}
		}
		Object.keys(pars.signals).forEach(k => {
			if (!tilesPromise[k]) {
				pars.signals[k].abort();
				delete pars.signals[k];
			}
		});
		pars.tilesPromise = tilesPromise;
		// return out;
		// Promise.all(arr).then((out) => {
			// resolve(out);
		// });
	// });
};

export default {
	load
};