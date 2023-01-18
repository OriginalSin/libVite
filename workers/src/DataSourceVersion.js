import Requests from './Requests';
import TilesLoader from './TilesLoader';
import Renderer2d from './Renderer2d';

const HOST = 'maps.kosmosnimki.ru',
    WORLDWIDTHFULL = 40075016.685578496,
	W = WORLDWIDTHFULL / 2,
	WORLDBBOX = [[-W, -W, W, W]],
    SCRIPT = '/Layer/CheckVersion.ashx',
	GMXPROXY = '//maps.kosmosnimki.ru/ApiSave.ashx',
	MINZOOM = 1,
	MAXZOOM = 22,
    STYLEKEYS = {
        marker: {
            server: ['image',   'angle',     'scale',     'minScale',     'maxScale',     'size',         'circle',     'center',     'color'],
            client: ['iconUrl', 'iconAngle', 'iconScale', 'iconMinScale', 'iconMaxScale', 'iconSize', 'iconCircle', 'iconCenter', 'iconColor']
        },
        outline: {
            server: ['color',  'opacity',   'thickness', 'dashes'],
            client: ['color',  'opacity',   'weight',    'dashArray']
        },
        fill: {
            server: ['color',     'opacity',   'image',       'pattern',     'radialGradient',     'linearGradient'],
            client: ['fillColor', 'fillOpacity', 'fillIconUrl', 'fillPattern', 'fillRadialGradient', 'fillLinearGradient']
        },
        label: {
            server: ['text',      'field',      'template',      'color',      'haloColor',      'size',          'spacing',      'align'],
            client: ['labelText', 'labelField', 'labelTemplate', 'labelColor', 'labelHaloColor', 'labelFontSize', 'labelSpacing', 'labelAlign']
        }
    },
    STYLEFUNCKEYS = {
        // iconUrl: 'iconUrlFunction',
        iconSize: 'iconSizeFunction',
        iconAngle: 'rotateFunction',
        iconScale: 'scaleFunction',
        iconColor: 'iconColorFunction',
        opacity: 'opacityFunction',
        fillOpacity: 'fillOpacityFunction',
        color: 'colorFunction',
        fillColor: 'fillColorFunction'
/*
    },

    STYLEFUNCERROR = {
        // iconUrl: function() { return ''; },
        iconSize: function() { return 8; },
        iconAngle: function() { return 0; },
        iconScale: function() { return 1; },
        iconColor: function() { return 0xFF; },
        opacity: function() { return 1; },
        fillOpacity: function() { return 0.5; },
        color: function() { return 0xFF; },
        fillColor: function() { return 0xFF; }
    },
    DEFAULTSTYLES = {
       MinZoom: 1,
       MaxZoom: 21,
       Filter: '',
       Balloon: '',
       DisableBalloonOnMouseMove: true,
       DisableBalloonOnClick: false,
       RenderStyle: {
            point: {    // old = {outline: {color: 255, thickness: 1}, marker:{size: 8}},
                color: 0xFF,
                weight: 1,
                iconSize: 8
            },
            linestring: {    // old = {outline: {color: 255, thickness: 1}},
                color: 0xFF,
                weight: 1
            },
            polygon: {    // old = {outline: {color: 255, thickness: 1}},
                color: 0xFF,
                weight: 1
            }
        }
*/
    };

let hosts = {},
    zoom = 3,
    bbox = null,
	// dataManagersLinks = {},
    // hostBusy = {},
    // needReq = {}
    delay = 10000,
    // delay = 60000,
	intervalID = null,
    timeoutID = null;


const utils = {
    getCoordsPixels: function(attr) {
        var coords = attr.coords,
            z = attr.z,
			tpx = attr.tpx,
			tpy = attr.tpy,
            hiddenLines = attr.hiddenLines || [],
            pixels = [],
            hidden = [],
            hiddenFlag = false,
            mInPixel = Math.pow(2, z + 8) / WORLDWIDTHFULL;
			/*
			,
            hash = {
                // gmx: gmx,
				// topLeft: attr.topLeft,
                tpx: tpx,
                tpy: tpy,
                coords: null,
                hiddenLines: null
            };
			*/
        for (var j = 0, len = coords.length; j < len; j++) {
            // var coords1 = coords[j],
                // hiddenLines1 = hiddenLines[j] || [],
                // pixels1 = [], hidden1 = [];
			coords[j].forEach(ringMerc => {
                var res = utils.getRingPixels({
					ringMerc: ringMerc,
					tpx: tpx,
					tpy: tpy,
					mInPixel: mInPixel,
					hiddenLines: hiddenLines
				});
				pixels.push(res.pixels);
				// var tt = res;
			});
			/*
            for (var j1 = 0, len1 = coords1.length; j1 < len1; j1++) {
                hash.ringMerc = coords1[j1];
                hash.hiddenLines = hiddenLines1[j1] || [];
                var res = utils.getRingPixels(hash);
                pixels1.push(res.coords);
                hidden1.push(res.hidden);
                if (res.hidden) {
                    hiddenFlag = true;
                }
            }
            pixels.push(pixels1);
            hidden.push(hidden1);
			*/
        }
// console.log('aaaaaaaaaa', pixels, tpx, tpy)
		
        return {coords: pixels, hidden: hiddenFlag ? hidden : null, z: z};
    },

    getRingPixels: ({ringMerc, tpx, tpy, mInPixel, hiddenLines}) => {
// console.log('getRingPixels', ringMerc, tpx, tpy)
        if (ringMerc.length === 0) {
			return null;
		}
        var cnt = 0, cntHide = 0,
            lastX = null, lastY = null,
            vectorSize = typeof ringMerc[0] === 'number' ? 2 : 1,
            pixels = [], hidden = [];
        for (var i = 0, len = ringMerc.length; i < len; i += vectorSize) {
            var lineIsOnEdge = false;
            if (hiddenLines && i === hiddenLines[cntHide]) {
                lineIsOnEdge = true;
                cntHide++;
            }
            var c = vectorSize === 1 ? ringMerc[i] : [ringMerc[i], ringMerc[i + 1]],
                x1 = Math.round((c[0] + W) * mInPixel), y1 = Math.round((W - c[1]) * mInPixel),
                // x1 = Math.round((c[0] + 0) * mInPixel), y1 = Math.round((0 - c[1]) * mInPixel),
                // x2 = Math.round(x1 - tpx), y2 = Math.round(y1 - tpy);
                x2 = Math.round(c[0] * mInPixel), y2 = Math.round(c[1] * mInPixel);

            if (lastX !== x2 || lastY !== y2) {
                lastX = x2; lastY = y2;
                if (lineIsOnEdge) {
                    hidden.push(cnt);
                }
                pixels[cnt++] = x2;
                pixels[cnt++] = y2;
            }
        }
        return {pixels: pixels, hidden: hidden.length ? hidden : null};
    },
	getHidden: function(coords, tb) {  // массив точек на границах тайлов
        var hiddenLines = [],
            vectorSize = typeof coords[0] === 'number' ? 2 : 1,
            prev = null;
        for (var i = 0, len = coords.length; i < len; i += vectorSize) {
            var p = vectorSize === 1 ? coords[i] : [coords[i], coords[i + 1]];
            if (prev && gmxAPIutils.chkOnEdge(p, prev, tb)) {
                hiddenLines.push(i);
            }
            prev = p;
        }
        return hiddenLines;
    },
   
	now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
		console.log('stop:', intervalID, delay);
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec) {
		console.log('start:', intervalID, msec);
        if (msec) { delay = msec; }
        utils.stop();
        intervalID = setInterval(chkVersion, delay);
    },
/*
    parseLayerProps: function(prop) {
		// let ph = utils.getTileAttributes(prop);
		return Requests.extend(
			{
				properties: prop
			},
			utils.getTileAttributes(prop),
			utils.parseStyles(prop),
			utils.parseMetaProps(prop)
		);
    },
*/
    parseFilter: function(str) {
		let regex1 = /"(.+?)" in \((.+?)\)/g,
			regex2 = /"(.+?)"/g,
			regexMath = /(floor\()/g,
			body = str ? str
				.replace(/[[\]]/g, '"')
				.replace(regex1, '[$2].includes(props[indexes[\'$1\']])')
				.replace(regex2, 'props[indexes[\'$1\']]')
				.replace(/[^><]=[^><]/g, '===')
				.replace(/\bAND\b/g, '&&')
				.replace(/\bOR\b/g, '||')
				.replace(regexMath, 'Math.$1')
				: true;
		return {
			filter: str,
			filterParsed: body,
			filterFun: new Function('props', 'indexes', 'return ' + body + ';')
		};
    },

// StyleManager.decodeOldStyles = function(props) {
    // var styles = props.styles,
		// arr = styles || [{MinZoom: 1, MaxZoom: 21, RenderStyle: StyleManager.DEFAULT_STYLE}],
		// type = props.type.toLocaleLowerCase(),
		// gmxStyles = {
			// attrKeys: {},
			// iconsUrl: {}
		// };
	// gmxStyles.styles = arr.map(function(it) {
        // var pt = {
            // Name: it.Name || '',
            // type: type || '',
			// legend: false,
            // MinZoom: it.MinZoom || 0,
            // MaxZoom: it.MaxZoom || 18
        // };
		// pt.labelMinZoom = it.labelMinZoom || pt.MinZoom;
		// pt.labelMaxZoom = it.labelMaxZoom || pt.MaxZoom;

        // if ('Balloon' in it) {
            // pt.Balloon = it.Balloon;
			// var hash = StyleManager.getKeysHash(it.Balloon, 'Balloon');
			// if (Object.keys(hash).length) {
				// L.extend(gmxStyles.attrKeys, hash);
			// }
        // }
        // if (it.RenderStyle) {
            // var rt = StyleManager.decodeOldStyle(it.RenderStyle);
			// L.extend(gmxStyles.attrKeys, rt.attrKeys);
			// if (rt.style.iconUrl) { gmxStyles.iconsUrl[rt.style.iconUrl] = true; }
            // pt.RenderStyle = rt.style;
			// if (it.HoverStyle === undefined) {
				// var hoveredStyle = JSON.parse(JSON.stringify(pt.RenderStyle));
				// if (hoveredStyle.outline) { hoveredStyle.outline.thickness += 1; }
				// pt.HoverStyle = hoveredStyle;
			// } else if (it.HoverStyle === null) {
				// delete pt.HoverStyle;
			// } else {
				// var ht = StyleManager.decodeOldStyle(it.HoverStyle);
				// pt.HoverStyle = ht.style;
			// }
        // } else if (type === 'vector ') {
            // pt.RenderStyle = StyleManager.DEFAULT_STYLE;
		// }

        // if ('DisableBalloonOnMouseMove' in it) {
            // pt.DisableBalloonOnMouseMove = it.DisableBalloonOnMouseMove === false ? false : true;
        // }
        // if ('DisableBalloonOnClick' in it) {
            // pt.DisableBalloonOnClick = it.DisableBalloonOnClick || false;
        // }
        // if ('Filter' in it) {	// TODO: переделать на new Function = function(props, indexes, types)
// /*eslint-disable no-useless-escape */
            // pt.Filter = it.Filter;
            // var ph = L.gmx.Parsers.parseSQL(it.Filter.replace(/[\[\]]/g, '"'));
// /*eslint-enable */
			// TODO: need body for function ƒ (props, indexes, types)
            // if (ph) { pt.filterFunction = ph; }
        // }
		// return pt;
	// });
    // return gmxStyles;
// };
    dec2rgba: function(i, a)	{				// convert decimal to rgb
        var r = (i >> 16) & 255,
            g = (i >> 8) & 255,
            b = i & 255;
		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
	},

	decodeOldStyle: function(style) {   // Style Scanex->leaflet
		let st, i, len, key, key1,
			styleOut = {};
			// attrKeys = {},
			// type = '';

		for (key in STYLEKEYS) {
			let keys = STYLEKEYS[key];
			for (i = 0, len = keys.client.length; i < len; i++) {
				key1 = keys.client[i];
				if (key1 in style) {
					styleOut[key1] = style[key1];
				}
			}
			st = style[key];
			if (st && typeof (st) === 'object') {
				for (i = 0, len = keys.server.length; i < len; i++) {
					key1 = keys.server[i];
					if (key1 in st) {
						var newKey = keys.client[i],
							zn = st[key1];
// console.log('sssss ', key, key1, zn, st);
						if (typeof (zn) === 'string') {
							// var hash = StyleManager.getKeysHash(zn, newKey);
							// if (Object.keys(hash).length) {
								// styleOut.common = false;
								// L.extend(attrKeys, hash);
							// }
							if (STYLEFUNCKEYS[newKey]) {
								// if (zn.match(/[^\d\.]/) === null) {
									// zn = Number(zn);
								// } else {
									//var func = L.gmx.Parsers.parseExpression(zn);
									// if (func === null) {
										// zn = STYLEFUNCERROR[newKey]();
									// } else {
										// styleOut[STYLEFUNCKEYS[newKey]] = func;
									// }
								// }
							}
						} else if (key1 === 'opacity') {
							zn /= 100;
						} else if (key1 === 'color') {
							zn = utils.dec2rgba(zn, st.opacity !== undefined ? st.opacity : 1);
						}
						styleOut[newKey] = zn;
					}
				}
			}
		}
		if (style.marker) {
			st = style.marker;
			if ('dx' in st || 'dy' in st) {
				var dx = st.dx || 0,
					dy = st.dy || 0;
				styleOut.iconAnchor = [-dx, -dy];    // For leaflet type iconAnchor
			}
		}
// console.log('styleOut ', styleOut);
		for (key in style) {
			if (!STYLEKEYS[key]) {
				styleOut[key] = style[key];
			}
		}
		return styleOut;
/*
		return {
			style: styleOut,			// стиль
			// attrKeys: attrKeys,			// используемые поля атрибутов
			type: type					// 'polygon', 'line', 'circle', 'square', 'image'
		};
*/
	},
    getTileBounds: function(coords) {
		var tileSize = WORLDWIDTHFULL / Math.pow(2, coords.z),
            minx = coords.x * tileSize - W,
            miny = W - coords.y * tileSize;
        return Requests.bounds([[minx, miny], [minx + tileSize, miny + tileSize]]);
    },

    getTileNumFromLeaflet: function (tilePoint, zoom) {
        if ('z' in tilePoint) {
            zoom = tilePoint.z;
        }
        var pz = Math.pow(2, zoom),
            tx = tilePoint.x % pz + (tilePoint.x < 0 ? pz : 0),
            ty = tilePoint.y % pz + (tilePoint.y < 0 ? pz : 0);
        return {
            z: zoom,
            x: tx % pz - pz / 2,
            y: pz / 2 - 1 - ty % pz
        };
    },

    _getMaxStyleSize: function(zoom, styles) {  // estimete style size for arbitrary object
        var maxSize = 0;
        for (var i = 0, len = styles.length; i < len; i++) {
            var style = styles[i];
            if (zoom > style.MaxZoom || zoom < style.MinZoom) { continue; }
            var RenderStyle = style.RenderStyle;
            if (this._needLoadIcons || !RenderStyle || !('maxSize' in RenderStyle)) {
                maxSize = 128;
                break;
            }
            var maxShift = 0;
            if ('iconAnchor' in RenderStyle && !RenderStyle.iconCenter) {
                maxShift = Math.max(
                    Math.abs(RenderStyle.iconAnchor[0]),
                    Math.abs(RenderStyle.iconAnchor[1])
                );
            }
            maxSize = Math.max(RenderStyle.maxSize + maxShift, maxSize);
        }
        return maxSize;
    },

    parseStyles: (prop) => {
        let styles = prop.styles || [];
			// attr = prop.tileAttributeIndexes,
		// prop._maxStyleSize = 128;
		prop._maxStyleSize = 0;
		let gmxStyles = [];
		let out = styles.map(it => {
			let renderStyle = it.RenderStyle || {};
			let renderStyleNew = utils.decodeOldStyle(renderStyle);
			// if (renderStyle) {
				// renderStyleNew = utils.decodeOldStyle(renderStyle);
			// }
			renderStyleNew.MinZoom = it.MinZoom || MINZOOM;
			renderStyleNew.MaxZoom = it.MaxZoom || MAXZOOM;
			gmxStyles.push({...renderStyleNew});
			return new Promise(resolve => {
				let data = utils.parseFilter(it.Filter || '');
				data.MinZoom = renderStyleNew.MinZoom;
				data.MaxZoom = renderStyleNew.MaxZoom;
				// if (renderStyle) {
					data.renderStyle = renderStyleNew;
				// }

				let iconUrl = renderStyle.iconUrl || (renderStyle.marker && renderStyle.marker.image);
				if (iconUrl) {
					Requests.getBitMap(iconUrl).then(blob => {
	// .then(function(blob) {
		// return createImageBitmap(blob, {
			// premultiplyAlpha: 'none',
			// colorSpaceConversion: 'none'
		// });
						
						// console.log('dsddd', blob);
						return createImageBitmap(blob, {
							premultiplyAlpha: 'none',
							colorSpaceConversion: 'none'
						}).then(imageBitmap => {
							data.imageBitmap = imageBitmap;
							if (prop._maxStyleSize < imageBitmap.width) { prop._maxStyleSize = imageBitmap.width; }
							if (prop._maxStyleSize < imageBitmap.height) { prop._maxStyleSize = imageBitmap.height; }
							resolve(data);
						}).catch(console.warn);
						// resolve(data);
					});
				} else {
					if (prop._maxStyleSize < data.renderStyle.weight) { prop._maxStyleSize = data.renderStyle.weight; }
					resolve(data);
				}
				// return data;
			})
		});
		prop.gmxStyles = gmxStyles;
		return {
			stylesPromise: Promise.all(out)
		};
    },

    parseMetaProps: function(prop) {
        var meta = prop.MetaProperties || {},
            ph = {};
        ph.dataSource = prop.dataSource || prop.LayerID || '';
		[
			'srs',					// проекция слоя
			'dataSource',			// изменить dataSource через MetaProperties
			'gmxProxy',				// установка прокачивалки
			'filter',				// фильтр слоя
			'isGeneralized',		// флаг generalization
			'isFlatten',			// флаг flatten
			'multiFilters',			// проверка всех фильтров для обьектов слоя
			'showScreenTiles',		// показывать границы экранных тайлов
			'dateBegin',			// фильтр по дате начало периода
			'dateEnd',				// фильтр по дате окончание периода
			'shiftX',				// сдвиг всего слоя
			'shiftY',				// сдвиг всего слоя
			'shiftXfield',			// сдвиг растров объектов слоя
			'shiftYfield',			// сдвиг растров объектов слоя
			'quicklookPlatform',	// тип спутника
			'quicklookX1',			// точки привязки снимка
			'quicklookY1',			// точки привязки снимка
			'quicklookX2',			// точки привязки снимка
			'quicklookY2',			// точки привязки снимка
			'quicklookX3',			// точки привязки снимка
			'quicklookY3',			// точки привязки снимка
			'quicklookX4',			// точки привязки снимка
			'quicklookY4'			// точки привязки снимка
		].forEach((k) => {
			if (k in meta) {
				ph[k] = meta[k].Value || '';
			}
		});
		if (ph.gmxProxy && ph.gmxProxy.toLowerCase() === 'true') {		// проверка прокачивалки
			ph.gmxProxy = GMXPROXY;
		}
		if ('parentLayer' in meta) {					// изменить dataSource через MetaProperties
			ph.dataSource = meta.parentLayer.Value;
		}

        return ph;
    },

    getTileAttributes: function(prop) {
        let tileAttributeIndexes = {},
            tileAttributeTypes = {};
        if (prop.attributes) {
            let attrs = prop.attributes,
                attrTypes = prop.attrTypes || null;
            if (prop.identityField) { tileAttributeIndexes[prop.identityField] = 0; }
            for (let a = 0; a < attrs.length; a++) {
                let key = attrs[a];
                tileAttributeIndexes[key] = a + 1;
                tileAttributeTypes[key] = attrTypes ? attrTypes[a] : 'string';
            }
        }
        return {
            tileAttributeTypes: tileAttributeTypes,
            tileAttributeIndexes: tileAttributeIndexes
        };
    },

	getStyleNum: function(itemArr, layerAttr, zoom) {
		let indexes = layerAttr.tileAttributeIndexes;
		if (layerAttr.stylesParsed) {
			for (let i = 0, len = layerAttr.stylesParsed.length; i < len; i++) {
				let st = layerAttr.stylesParsed[i];
				if (zoom && (zoom < st.MinZoom || zoom > st.MaxZoom)) { continue; }
				if (st.filterFun(itemArr, indexes)) { return i; }
			}
		} else {
			return 0;
		}
		return -1;
	}
};

// const COMPARS = {WrapStyle: 'None', ftc: 'osm', srs: 3857};

// const chkSignal = (signalName, signals, opt) => {
	// opt = opt || {};
	// let sObj = signals[signalName];
	
	// if (sObj) { sObj.abort(); }
	// sObj = signals[signalName] = new AbortController();
	// sObj.signal.addEventListener('abort', (ev) => console.log('Отмена fetch:', ev));
	// opt.signal = sObj.signal;
	// signals[signalName] = sObj;
	// return opt;
// };

const chkHost = (hostName) => {
	// console.log('chkVersion:', hostName, hosts);
	let hostLayers = hosts[hostName],
		ids = hostLayers.ids,
		arr = [];

	for (let name in ids) {
		let pt = ids[name],
			pars = { Name: name, Version: 'v' in pt ? pt.v : -1 };
		if (pt.dateBegin) {
			pars.dateBegin = pt.dateBegin;
		}
		if (pt.dateEnd) {
			pars.dateEnd = pt.dateEnd;
		}
		arr.push(pars);
	}

	return Requests.getJson({
		url: '//' + hostName + SCRIPT,
		options: hostLayers.signals ? Requests.chkSignal('chkVersion', hostLayers.signals) : {},
		paramsArr: [Requests.COMPARS, {
			layers: JSON.stringify(arr),
			bboxes: JSON.stringify(bbox || WORLDBBOX),
			// generalizedTiles: false,
			zoom: zoom
		}]
	}).then(json => {
		delete hostLayers.signals.chkVersion;
		return json;
	})
	.catch(err => {
		console.error(err);
		// resolve('');
	});
};
const chkVersion = () => {
// console.log('chkVersion', hosts);
	for (let host in hosts) {
		let hostLayers = hosts[host],
			ids = hostLayers.ids;
		if (ids) {
			chkHost(host).then(json => {
				if (json.error) {
					console.warn('chkVersion:', json.error);
				} else {
					let res = json.res;
					if (res.Status === 'ok' && res.Result) {
						res.Result.forEach(it => {
							let pt = ids[it.name],
								props = it.properties;
							if (props) {
								pt.v = props.LayerVersion;
								pt.properties = props;
								pt.geometry = it.geometry;
								if (!pt.tileAttributeIndexes) {
									Requests.extend(pt, utils.getTileAttributes(props));
								}
							}
							pt.hostName = host;
							pt.tiles = it.tiles;
							pt.tilesOrder = it.tilesOrder;
							// pt.tilesPromise = 
							TilesLoader.load(pt);
							Promise.all(Object.values(pt.tilesPromise)).then((res) => {
								//self.postMessage({res: res, host: host, dmID: it.name, cmd: 'TilesData'});

					// console.log('tilesPromise ___:', hosts, res);
								_waitCheckObservers();
							});

							// pt.tilesPromise.then(res => {
					// console.log('tilesPromise ___:', hosts, res);
							// });
					// console.log('chkVersion ___:', pt);
						});
						// resolve(res.Result.Key !== 'null' ? '' : res.Result.Key);
					// } else {
						// reject(json);
						// console.log('chkVersion key:', host, hosts);
					}
				}
			});
		}
	}
};

const addSource = (pars) => {
	pars = pars || {};

	let id = pars.id;
	
	if ('zoom' in pars) { zoom = pars.zoom; }
	if ('bbox' in pars) { bbox = pars.bbox; }
		
	if (id) {
		let hostName = pars.hostName || HOST;
		if (!hosts[hostName]) {
			hosts[hostName] = {ids: {}, signals: {}};
			if (pars.apiKey) {
				hosts[hostName].apiKeyPromise = Requests.getJson({
					url: '//' + hostName + '/ApiKey.ashx',
					paramsArr: [Requests.COMPARS, {
						Key: pars.apiKey
					}]
				}).then((json) => {
					// console.log('/ApiKey.ashx', json);
					let res = json.res;
					if (res.Status === 'ok' && res.Result) {
						hosts[hostName].Key = res.Result.Key;
						return hosts[hostName].Key;
					}
				});
			}

		}
		hosts[hostName].ids[id] = pars;
        if (!intervalID) { utils.start(); }
		utils.now();
	} else {
		console.warn('Warning: Specify layer `id` and `hostName`', pars);
	}
	if (pars.vid) {
		let parseLayers = hosts[pars.vHostName || HOST].parseLayers;
		if (parseLayers) {
			let linkAttr = parseLayers.layersByID[pars.vid];
			Requests.extend(linkAttr, utils.parseStyles(linkAttr.properties));
			linkAttr.stylesPromise.then((res) => {
				linkAttr.styles = res;
			});
		}
	}

// console.log('addSource:', pars);
	return;
};

const removeSource = (pars) => {
	pars = pars || {};

	let id = pars.id;
	if (id) {
		let hostName = pars.hostName || HOST;
		if (hosts[hostName]) {
			let pt = hosts[hostName].ids[id];
console.log('signals:', pt.signals, pt);
			if (pt.signals) {
				Object.values(pt.signals).forEach((it) => {
					it.abort();
				});
			}
			delete hosts[hostName].ids[id];
			if (Object.keys(hosts[hostName].ids).length === 0) { delete hosts[hostName]; }
			if (Object.keys(hosts).length === 0) { utils.stop(); }
		}
	} else {
		console.warn('Warning: Specify layer id and hostName', pars);
	}
// console.log('removeSource:', pars);
	//Requests.removeDataSource({id: message.layerID, hostName: message.hostName}).then((json) => {
	return;
};

const moveend = (pars) => {
	pars = pars || {};
// console.log('moveend:', pars);
	
	if ('zoom' in pars) { zoom = pars.zoom; }
	if ('bbox' in pars) { bbox = pars.bbox; }
		
	utils.now();
	return;
};

let _checkObserversTimer = null;
const _waitCheckObservers = () => {
	if (_checkObserversTimer) { clearTimeout(_checkObserversTimer); }
	_checkObserversTimer = setTimeout(checkObservers, 25);
};
/*
const chkTiles = (opt) => {
	let	arr = [],
		tcnt = 0,
		pars = opt.observer.pars,
		// dateInterval = pars.dateInterval,
		obbox = pars.bbox;
	for (let i = 0, len = opt.tiles.length; i < len; i++) {
		let tile = opt.tiles[i],
			bbox = tile.bbox;
		if (bbox[0] > obbox.max.x || bbox[2] < obbox.min.x || bbox[1] > obbox.max.y || bbox[3] < obbox.min.y) {continue;}
		tcnt++;
	}
console.log('chkTiles _1______________:', tcnt, pars.zKey, opt); //, tile.z, tile.x, tile.y, tile.span, tile.level);
	return arr;

};
*/
const getStyleNum = (arr, styles, indexes, z) => {
	// let out = -1;
	return 0;
};

const _parseItem = ({item, st, bounds, hiddenLines, pars}) => {
	// let geo = item[item.length - 1],
		// type = geo.type,
		// z = pars.z;
	// EdgeLines calc
	// var edgeArr = gmxAPIutils.getHidden(coords[i][j], edgeBounds);
	// hiddenLines1.push(edgeArr);
	// if (edgeArr.length) {
		// hiddenFlag = true;
	// }

	return {
	};
};
/*
    _parseItem: function(it) {
        var len = it.length - 1,
			// props = new Uint32Array(len),
			i;

        // props[0] = it[0];
		// TODO: old properties null = ''
        for (i = 1; i < len; i++) {
            if (it[i] === null) { it[i] = ''; }
			// props[i] = this._getLinkProp(i, it[i]);
        }

        var geo = it[len],
            needFlatten = this.isFlatten,
            type = geo.type,
            isLikePolygon = type.indexOf('POLYGON') !== -1 || type.indexOf('Polygon') !== -1,
            isPolygon = type === 'POLYGON' || type === 'Polygon',
            coords = geo.coordinates,
            hiddenLines = [],
            bounds = null,
            boundsArr = [];

        if (isLikePolygon) {
            if (isPolygon) { coords = [coords]; }
            bounds = gmxAPIutils.bounds();
            var edgeBounds = gmxAPIutils.bounds().extendBounds(this.bounds).addBuffer(-0.05),
                hiddenFlag = false;
            for (i = 0, len = coords.length; i < len; i++) {
                var arr = [],
                    hiddenLines1 = [];

                for (var j = 0, len1 = coords[i].length; j < len1; j++) {
                    if (needFlatten && typeof coords[i][j][0] !== 'number') {
                        coords[i][j] = gmxAPIutils.flattenRing(coords[i][j]);
                    }
                    var b = gmxAPIutils.bounds(coords[i][j]);
                    arr.push(b);
                    if (j === 0) { bounds.extendBounds(b); }
                    // EdgeLines calc
                    var edgeArr = gmxAPIutils.getHidden(coords[i][j], edgeBounds);
                    hiddenLines1.push(edgeArr);
                    if (edgeArr.length) {
                        hiddenFlag = true;
                    }
                }
                boundsArr.push(arr);
                hiddenLines.push(hiddenLines1);
            }
            if (!hiddenFlag) { hiddenLines = null; }
            if (isPolygon) { boundsArr = boundsArr[0]; }
        } else if (type === 'POINT' || type === 'Point') {
            bounds = gmxAPIutils.bounds([coords]);
        } else if (type === 'MULTIPOINT' || type === 'MultiPoint') {
            bounds = gmxAPIutils.bounds();
            for (i = 0, len = coords.length; i < len; i++) {
                bounds.extendBounds(gmxAPIutils.bounds([coords[i]]));
            }
        } else if (type === 'LINESTRING' || type === 'LineString') {
            bounds = gmxAPIutils.bounds(coords);
        } else if (type === 'MULTILINESTRING' || type === 'MultiLineString') {
            bounds = gmxAPIutils.bounds();
            for (i = 0, len = coords.length; i < len; i++) {
                bounds.extendBounds(gmxAPIutils.bounds(coords[i]));
            }
        }
        var dataOption = {
            id: it[0],
            type: type,
			processing: this.processing,
			currentFilter: null,
            properties: it,
			options: {
				fromTiles: {},
				isGeneralized: this.isGeneralized
			},
			// options: {
				// fromTiles: {5_23_6_52334_14179_1: 1},
				// unixTimeStamp: 1540599811000
			// },
            // props: props,
            bounds: bounds,
            boundsArr: boundsArr
        };
        if (hiddenLines) {
            dataOption.hiddenLines = hiddenLines;
        }
        return dataOption;
    }
*/
const _checkVectorTiles = ({arrTiles, observers, styles, indexes, sort}) => {
	for (let i = 0, len = arrTiles.length; i < len; i++) {
		let tile = arrTiles[i],
			pixels = tile.pixels,
			styleNums = tile.styleNums,
			itemsbounds = tile.itemsbounds,
			hiddenLines = tile.hiddenLines;
		if (!styleNums) {styleNums = tile.styleNums = [];}
		if (!itemsbounds) {itemsbounds = tile.itemsbounds = [];}
		if (!hiddenLines) {hiddenLines = tile.hiddenLines = [];}
		if (!pixels) {pixels = tile.pixels = [];}
		for (let zKey in observers) {
			let observer = observers[zKey];
			// let flag = observer.bounds.intersects(tile.bounds);

			// if (!observer.bounds.intersects(tile.bounds)) {
				// continue;
			// }

			if (!observer.tcnt) {observer.tcnt = 0;}
			observer.tcnt++;
			observer.items = [];
			tile.values.forEach((it, n) => {
				// let parsed = 
				_parseItem({
					hiddenLines: hiddenLines[n],
					bounds: itemsbounds[n],
					st: styleNums[n],
					pars: observer.pars,
					item: it
				});
				
				let geo = it[it.length - 1],
					st = styleNums[n],
					bounds = itemsbounds[n];
				if (st === undefined) {
					st = getStyleNum(it, styles, indexes, observer.pars.z);
					tile.styleNums[n] = styleNums[n] = st;
				}
				if (!bounds) {
					bounds = Requests.geoItemBounds(geo);
					tile.itemsbounds[n] = itemsbounds[n] =  bounds;
				}

				let pt = {
					tbbox: tile.bbox,
					st: st,
					style: styles[st],
					itemData: {
						bounds: bounds,
						hiddenLines: hiddenLines[n],
						item: it
					}
				};
				// TODO: если НЕТ сортировки объектов то тут отрисовка иначе после сортировки
				if (sort) {
					observer.items.push(pt);
				} else {
					pt.observer = observer;
					drawItem(pt);
				}
			});
		}
	}
// console.log('checkObservers _____1__________:', hosts);
};

const checkObservers = () => {
	// console.log('checkObservers _______________:', hosts);
	Object.keys(hosts).forEach(host => {
		Object.keys(hosts[host].ids).forEach(layerID => {
			let	tData = hosts[host].ids[layerID],
				layerData = hosts[host].parseLayers.layersByID[layerID],
				// styles = layerData.styles || [],
				// oKeys = Object.keys(tData.observers),
				observers = tData.observers || {},
				indexes = tData.tileAttributeIndexes,
				tilesPromise = tData.tilesPromise;
			if (tilesPromise) {
				layerData.stylesPromise.then((arrStyle) => {
					const styles = arrStyle || [];
					let _maxStyleSize = layerData.properties._maxStyleSize || 128;
					Object.keys(observers).forEach(key => {
						let observer = observers[key];
						if (!observer.bounds) {
							let coords = observer.pars.coords,
								z = observer.pars.z;
							_maxStyleSize = utils._getMaxStyleSize(z, styles);

							// var mercSize = 2 * _maxStyleSize * WORLDWIDTHFULL / Math.pow(2, 8 + z); //TODO: check formula

							observer.bounds = utils.getTileBounds(coords);
						}
						
					});
					Promise.all(Object.values(tilesPromise)).then((arrTiles) => {
						_checkVectorTiles({
							sort: layerData.sorting,
							arrTiles: arrTiles,
							observers: observers,
							styles: styles,
							indexes: indexes
						});
						for (let zKey in observers) {
							let observer = observers[zKey],
								pars = observer.pars;
							pars.bitmap = observer.canvas.transferToImageBitmap();
							observer.resolver(pars);
							delete observers[zKey];
							// observer.resolver({
								// bitmap: observer.canvas.transferToImageBitmap()
							// });
						}
						/*
						for (let i = 0, len = arrTiles.length; i < len; i++) {
							let tile = arrTiles[i],
								styleNums = tile.styleNums,
								itemsbounds = tile.itemsbounds;
							if (!styleNums) {styleNums = tile.styleNums = [];}
							if (!itemsbounds) {itemsbounds = tile.itemsbounds = [];}
							for (let j = 0, len1 = oKeys.length; j < len1; j++) {
								let zKey = oKeys[j],
									observer = tData.observers[zKey];

								if (!observer || !observer.bounds.intersects(tile.bounds)) {continue;}

								if (!observer.tcnt) {observer.tcnt = 0;}
								observer.tcnt++;
								observer.items = [];
								tile.values.forEach((it, n) => {
									let geo = it[it.length - 1],
										st = styleNums[n],
										bounds = itemsbounds[n];
									if (st === undefined) {st = styleNums[n] = getStyleNum(it, styles, tData.tileAttributeIndexes, observer.pars.z);}
									if (!bounds) {bounds = itemsbounds[n] = Requests.geoItemBounds(geo);}

									observer.items.push(it);
								});
							}
						}
						*/
			// console.log('checkObservers _____1__________:', hosts, arrStyle);
					});
				});
			}
		});
	});
};

const addObserver = (pars) => {

console.log('addObserver_______________:', pars, hosts);
	return new Promise((resolve) => {
		let layerID = pars.layerID,
			zKey = pars.zKey,
			host = hosts[pars.hostName || HOST],
			out = {...pars};
		if (host && host.parseLayers && host.parseLayers.layersByID[layerID] && host.ids && host.ids[layerID]) {
			// let stData = host.parseLayers.layersByID[layerID],
			let	tData = host.ids[layerID];
			if (!tData.observers) { tData.observers = {}; }
			// let bounds = Requests.bounds();
			if (pars.bbox) { bounds = bounds.extendBounds(pars.bbox); }
			tData.observers[zKey] = {
				// bounds: bounds,
				pars: pars,
				resolver: resolve
			};
// console.log('addObserver ____1_______:', stData, tData);
			// start Recheck Observers on next frame
			_waitCheckObservers();
			// out.data = layerID;
			// resolve(out);
		} else {
			out.error = 'Нет слоя: ' + layerID;
			resolve(out);
		}
	});
};

const removeObserver = (pars) => {
	let host = hosts[pars.hostName];
	if (host && host.ids[pars.layerID]) {
		let observers = host.ids[pars.layerID].observers;
		if (observers) {
			observers[pars.zKey].resolver([]);
			delete observers[pars.zKey];
		}
	}
// console.log('removeObserver _______________:', pars, hosts);
};

const setDateInterval = (pars) => {
	pars = pars || {};
	let host = hosts[pars.hostName];
	if (host && host.ids[pars.id]) {
		host.ids[pars.id].dateBegin = pars.dateBegin;
		host.ids[pars.id].dateEnd = pars.dateEnd;
	}
	utils.now();

// console.log('setDateInterval:', pars, hosts);
};

const _iterateNodeChilds = (node, level, out) => {
	level = level || 0;
	out = out || {
		layers: [],
		layersByID: {}
	};
	
	if (node) {
		let type = node.type,
			content = node.content,
			props = content.properties;
		if (type === 'layer') {
			let ph = {
				properties: props,
				level: level
			};
			// let ph = utils.parseLayerProps(props);
			// ph.level = level;
			if (content.geometry) { ph.geometry = content.geometry; }
			out.layers.push(ph);
			out.layersByID[props.name] = ph;
		} else if (type === 'group') {
			let childs = content.children || [];
			out.layers.push({ level: level, group: true, childsLen: childs.length, properties: props });
			childs.map((it) => {
				_iterateNodeChilds(it, level + 1, out);
			});
		}
		
	} else {
		return out;
	}
	return out;
};

const parseTree = (json) => {
	let out = {};
	if (json.Status === 'error') {
		out = json;
	} else if (json.Result && json.Result.content) {
		out = _iterateNodeChilds(json.Result);
		out.mapAttr = out.layers.shift();
	}
// console.log('______json_out_______', out, json)
	return out;
};

const drawTest = (pars) => {
	const canvas = new OffscreenCanvas(256, 256),
	// const canvas = message.canvas,
		w = canvas.width,
		h = canvas.height,
		ctx = canvas.getContext('2d');
		// gl = canvas.getContext('webgl');
	// ctx.fillStyle = 'red';
	// ctx.lineWidth = 5;
	// ctx.rect(5, 5, w - 5, h - 5);
	// ctx.fill();
	
	Renderer2d.updatePoly({
		coords: pars.coords,
		_drawing: true,
		closed: true,
		_ctx: ctx,
		canvas: canvas,
		w: w,
		h: h,
		options: pars.options || {
			fillRule: 'evenodd',
			_dashArray: null,
			lineCap: "butt",
			lineJoin: "miter",
			color: "green",
			fillColor: "blue",
			interactive: true,
			smoothFactor: 1,
			weight: 10,
			opacity: 1,
			fillOpacity: 1,
			stroke: true,
			fill: false
		},
		_parts: pars._parts || [[{"x":0,"y":0},{"x":255,"y":255},{"x":255,"y":0},{"x":0,"y":255}]]
		// _parts: message._parts || [[{"x":54,"y":40},{"x":95,"y":40},{"x":95,"y":88}]]
	});
	// delete message. ;
	// message.out = {done: true};
	// let bitmap = canvas.transferToImageBitmap();
	return {
		bitmap: canvas.transferToImageBitmap()
	};
};

const drawTile = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || HOST,
		layerID = pars.layerID,
		host = hosts[hostName],
		parsedLayer = host.parseLayers.layersByID[layerID],
		ids = host.ids[layerID];
 // console.log('drawTile:', pars);

	return new Promise((resolve) => {
		parsedLayer.stylesPromise.then(st => {
			Promise.all(Object.values(ids.tilesPromise)).then((res) => {

	// console.log('drawTile tilesPromise ___:', st, res);
				resolve(Requests.extend(
					drawTest(pars), pars
				));
			});
		});
		// if (host && host.layerTree) {
			// resolve(host.layerTree);
		// } else {
			// Requests.getJson({
				// url: '//' + hostName + '/Map/GetMapFolder',
				// options: {},
				// params: {
					// srs: 3857, 
					// skipTiles: 'All',
					// mapId: pars.mapID,
					// folderId: 'root',
					// visibleItemOnly: false
				// }
			// }).then(json => {
				// if (!hosts[hostName]) { hosts[hostName] = {ids: {}, signals: {}}; }
 // console.log('getMapTree:', hosts, json);
				// resolve(json);
				// hosts[hostName].layerTree = json.res.Result;
				// hosts[hostName].parseLayers = parseTree(json.res);
			// })
		// }
	});
};

const _parseGeo = (pars) => {
	let observer = pars.observer,
		tn = observer.pars.coords,
		itemData = pars.itemData,
		item = itemData.item,
		
		geo = item[item.length - 1],
		geoType = geo.type,
		out;
	
    if (geoType === 'POLYGON' || geoType === 'MULTIPOLYGON') {
		let coords = geo.coordinates;
		if (geoType === 'POLYGON') { coords = [coords]; }
		out = utils.getCoordsPixels({
			coords: coords,
			z: tn.z,
			tpx: pars.tpx,
			tpy: pars.tpy
		});
	}
	return out;
};

const drawItem = (pars) => {
	let observer = pars.observer,
		ctx = observer.ctx,
		style = pars.style || {},
		itemData = pars.itemData,
		item = itemData.item,
		last = item.length - 1,
		geo = item[last],
		type = geo.type,
		coords = observer.pars.coords,
		tz = Math.pow(2, coords.z),
		// tpx = 256 * coords.x,
		// tpy = 256 * coords.y,

		tpx = 256 * Math.abs(coords.x % tz),
		tpy = 256 * Math.abs(coords.y % tz);
		// tpy = 256 * (1 + coords.y),
    var gmxTilePoint = utils.getTileNumFromLeaflet(coords);
    tpx = 256 * gmxTilePoint.x;
    tpy = 256 * (1 + gmxTilePoint.y);

	let	pt = {
			_merc: true,		// TODO: рисование напрямую из Меркатора
			mInPixel: Math.pow(2, coords.z + 8) / WORLDWIDTHFULL,
			_drawing: true,
			closed: true,
			_ctx: ctx,
			tpx: tpx,
			tpy: tpy,
			itemData: itemData,
			options: style.renderStyle || {
				// fillRule: 'evenodd',
				// _dashArray: null,
				// lineCap: "butt",
				// lineJoin: "miter",
				// color: "green",
				// fillColor: "blue",
				// interactive: true,
				// smoothFactor: 1,
				// weight: 5,
				// opacity: 1,
				// fillOpacity: 0.5,
				// stroke: true,
				// fill: false
			},
			_parts: itemData.pixels || [[{"x":0,"y":0},{"x":255,"y":255},{"x":255,"y":0},{"x":0,"y":255}]]
		};
	/*
	// TODO: рисование напрямую из Меркатора
		tpx - сдвиг px по X
		tpy - сдвиг px по Y
	*/
// if (coords.x === -1 && coords.y === 0 && coords.z === 1) {
	// console.log('ddd', coords, tpx, tpx1, tpy, tpy1, pt);
// }
	if (!itemData.pixels) {
		pars.tpx = tpx;
		pars.tpy = tpy;
		let tt = _parseGeo(pars);
		itemData.pixels = tt.coords;
		itemData.hidden = tt.hidden;
	}
	if (!ctx) {
		const canvas = new OffscreenCanvas(256, 256);
		canvas.width = canvas.height = 256;
		observer.canvas = canvas;
		
	// const canvas = message.canvas,
		// w = canvas.width,
		// h = canvas.height,
		pt._ctx = observer.ctx = canvas.getContext('2d');
		
	}

pt._ctx.fillText(coords.x + ':' + coords.y + ':' + coords.z, 128, 128);
	// Renderer2d.updatePoly(pt);
	Renderer2d.updatePolyMerc(pt);
	
	// delete message. ;
	// message.out = {done: true};
	// let bitmap = canvas.transferToImageBitmap();
	// return {
		// bitmap: canvas.transferToImageBitmap()
	// };
}

const getTile = (pars) => {
	let message = pars.attr,
		hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		z = message.z,
		hostLayers = hosts[hostName];

	if (hostLayers && hostLayers.ids && hostLayers.ids[layerID]) {
		let observers = hostLayers.ids[layerID].observers;
		for (let key in observers) {
			if (observers[key].pars.z !== z) {
				observers[key].resolver(null);
				delete observers[key];
			}
		}
	}
// console.log('vvvvvvvvvv ___res____ ', message);
	return Promise.all(queue.map(coords => 
		addObserver(Requests.extend({
			coords: coords,
			zKey: coords.x + ':' + coords.y + ':' + coords.z
		}, message))
	));
};

const getTiles = (message) => {
	let hostName = message.hostName,
		layerID = message.layerID,
		queue = message.queue,
		z = message.z,
		hostLayers = hosts[hostName];

	if (hostLayers && hostLayers.ids && hostLayers.ids[layerID]) {
		let observers = hostLayers.ids[layerID].observers;
		for (let key in observers) {
			if (observers[key].pars.z !== z) {
				observers[key].resolver(null);
				delete observers[key];
			}
		}
	}
// console.log('vvvvvvvvvv ___res____ ', message);
	return Promise.all(queue.map(coords => 
		addObserver(Requests.extend({
			coords: coords,
			zKey: coords.x + ':' + coords.y + ':' + coords.z
		}, message))
	));
};

const getMapTree = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || HOST,
		host = hosts[hostName];

	return new Promise((resolve) => {
		if (host && host.layerTree) {
			resolve(host.layerTree);
		} else {
			let apiKeyPromise = !host || !host.apiKeyPromise ? Requests.getJson({
					url: '//' + hostName + '/ApiKey.ashx',
					paramsArr: [{
						Key: pars.apiKey
					}]
				}) : host.apiKeyPromise;

			// if (!host || !host.apiKeyPromise) {
				// host.apiKeyPromise = Requests.getJson({
					// url: '//' + hostName + '/ApiKey.ashx',
					// paramsArr: [{
						// Key: pars.apiKey
					// }]
				// });
				
			// }
			apiKeyPromise.then(json => {
				// console.log('/ApiKey.ashx', json);
				let res = json.res;
				if (res.Status === 'ok' && res.Result) {
					return res.Result.Key;
				}
				return null;
			})
			.then(apiKey => {
				Requests.getJson({
					url: '//' + hostName + '/Map/GetMapFolder',
					// options: {},
					params: {
						apiKey: apiKey,
						srs: 3857, 
						skipTiles: 'All',
						mapId: pars.mapID,
						folderId: 'root',
						visibleItemOnly: false
					}
				}).then(json => {
					if (!hosts[hostName]) { hosts[hostName] = {ids: {}, signals: {}}; }
	 // console.log('getMapTree:', hosts, json);
					resolve(json);
					hosts[hostName].layerTree = json.res.Result;
					hosts[hostName].parseLayers = parseTree(json.res);
					if (apiKey) {
						hosts[hostName].apiKeyPromise = apiKeyPromise;
						hosts[hostName].apiKey = apiKey;
					}
				})
			});
		}
	});
};

const optDef = {
	WrapStyle: 'none',
	ModeKey: 'map',
	ftc: 'osm',
	skipTiles: 'All',
	srs: 3857,
	sw: 1,
	// key: '',
	MapName: 'DefaultMap'
};
const getMap = (pars) => {
	pars = pars || {};
	let hostName = pars.hostName || HOST;
	// if (!hosts[hostName]) { hosts[hostName] = {}; }
	// let host = hosts[hostName];

	if (pars.mapId) { pars.MapName = pars.mapId; }
	let attr = {...optDef, ...pars.attr};
// console.log('getMap', pars);
	const url = '//' + hostName + '/TileSender.ashx?' + Requests.getFormBody(attr) + '&' + Date.now();
	const opt = {
		method: 'get',
		// headers: {'Content-type': 'application/x-www-form-urlencoded'},
	// headers: {'Accept': 'application/json'},
	// body: JSON.stringify(params)	// TODO: сервер почему то не хочет работать так 
	};
	return fetch(url, opt)
	.then(res => res.json())
	.then(function(res) {
		if (res.Status === 'ok' && res.Result) {
			const parsed = parseMapTree(res.Result, hostName)
			hosts[hostName] = {
				...hosts[hostName],
				...parsed
			};
		// console.log('hosts', hosts);
			// if (hosts[hostName].needStart && !intervalID) { utils.start(); }
		}
		return {from: pars, ...res};
		// return utils.chkResponse(res, options.type);
	})
};
const parseMapTree = (mapInfo, hostName) => {
	// const host = hosts[hostName] || {ids: {}, signals: {}};
	const props = mapInfo.properties;
	const outInfo = {
		children: mapInfo.children,
		properties: props
	};
	const lHash = {};
	const lArr = [];
	let needStart = false;
	const fun = (it, i) => {
		if (it.type === 'layer') {
			let c = {...it.content};
			let prp = c.properties;
			const LayerID = prp.LayerID;
			if (prp.type === 'Vector') {
				if (prp.visible) {
					needStart = true;
					addSource({id: LayerID, hostName});
				}
				// c = {...c, ...utils.parseStyles(prp)};
			}
				c = {...c, ...utils.parseStyles(prp)};
			lArr.push(c);
			lHash[LayerID] = c;
		} else if (it.type === 'group') {
		}
		// console.log('11 iterateNode',host, it);
	};
	_parseNode(outInfo, fun, true);
	return {
		layerTree: mapInfo,
		parseLayers: {
			layers: lArr,
			layersByID: lHash,
			
		},
		// ids,
		// signals: {},
		needStart,
		// ...host
	};

	// gmxMap.layersCreated.then(function() {
		// gmxMap.layersCreatePromise(outInfo).then(function() {
			// resolve(json.Result);
		// });
	// });
};
const _parseNode = (treeInfo, callback, onceFlag) => {
// console.log('iterateNode',treeInfo, callback, onceFlag);
	const iterate = (node) => {
		const arr = node.children || [];
		for (let i = 0, len = arr.length; i < len; i++) {
			let layer = arr[i];

			if (callback(layer, node) && onceFlag) { break; }
			if (layer.type === 'group') {
				iterate(layer.content);
			}
		}
	};

	treeInfo && iterate(treeInfo);
};


/*
const iterateLayers = (treeInfo, callback) => {
	var iterate = function(arr) {
		for (var i = 0, len = arr.length; i < len; i++) {
			var layer = arr[i];

			if (layer.type === 'layer') {
				callback(layer.content);
			} else if (layer.type === 'group') {
				iterate(layer.content.children || []);
			}
		}
	};

	treeInfo && iterate(treeInfo.children);
};
*/
export default {
	getTile,
	getTiles,
	drawTile,
	addObserver,
	removeObserver,
	getMap,
	getMapTree,
	setDateInterval,
	moveend,
	removeSource,
	addSource
};