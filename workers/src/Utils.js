import Requests from './Requests';

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

const utils = {
	HOST,
    SCRIPT,
	WORLDBBOX,
	WORLDWIDTHFULL,
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
            maxy = W - coords.y * tileSize;
        return Requests.bounds([[minx, maxy - tileSize], [minx + tileSize, maxy]]);
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
	},

    isPointInPolygonArr: function(chkPoint, coords) { // Проверка точки на принадлежность полигону в виде массива
        var isIn = false,
            x = chkPoint[0],
            y = chkPoint[1],
            vectorSize = 1,
            p1 = coords[0];

        if (typeof coords[0] === 'number') {
            vectorSize = 2;
            p1 = [coords[0], coords[1]];
        }

        for (var i = vectorSize, len = coords.length; i < len; i += vectorSize) {
            var p2 = vectorSize === 1 ? coords[i] : [coords[i], coords[i + 1]],
                xmin = Math.min(p1[0], p2[0]),
                xmax = Math.max(p1[0], p2[0]),
                ymax = Math.max(p1[1], p2[1]);
            if (x > xmin && x <= xmax && y <= ymax && p1[0] !== p2[0]) {
                var xinters = (x - p1[0]) * (p2[1] - p1[1]) / (p2[0] - p1[0]) + p1[1];
                if (p1[1] === p2[1] || y <= xinters) { isIn = !isIn; }
            }
            p1 = p2;
        }
        return isIn;
    },

    /** Is point in polygon with holes
     * @memberof L.gmxUtil
     * @param {chkPoint} chkPoint - point in [x, y] format
     * @param {coords} coords - polygon from geoJSON coordinates data format
     * @return {Boolean} true if polygon contain chkPoint
    */
    isPointInPolygonWithHoles: function(chkPoint, coords) {
        if (!utils.isPointInPolygonArr(chkPoint, coords[0])) { return false; }
        for (var j = 1, len = coords.length; j < len; j++) {
            if (utils.isPointInPolygonArr(chkPoint, coords[j])) { return false; }
        }
        return true;
    },

};
export default utils;
