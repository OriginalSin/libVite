import {gmxAPIutils} from '../Utils.js';

(function() {
// TODO - проверка версии
var delay = 20000,
    layers = {},
    dataManagersLinks = {},
    script = '/Layer/CheckVersion.ashx',
    intervalID = null,
    timeoutID = null,
    hostBusy = {},
    needReq = {},
	w = gmxAPIutils.worldWidthMerc,
	WORLDBBOX = JSON.stringify([[-w, -w, w, w]]);

var isExistsTiles = function(prop) {
    var tilesKey = prop.Temporal ? 'TemporalTiles' : 'tiles';
    return tilesKey in prop || prop.currentTiles;
};
var getBboxes = function(mbbox) {
	var minY = mbbox.min.y, maxY = mbbox.max.y,
		minX = mbbox.min.x, maxX = mbbox.max.x,
		minX1 = null, maxX1 = null,
		ww = gmxAPIutils.worldWidthFull,
		size = mbbox.getSize(),
		out = [];

	if (size.x > ww) {
		return WORLDBBOX;
	}

	if (maxX > w || minX < -w) {
		var hs = size.x / 2,
			center = ((maxX + minX) / 2) % ww;

		center = center + (center > w ? -ww : (center < -w ? ww : 0));
		minX = center - hs; maxX = center + hs;
		if (minX < -w) {
			minX1 = minX + ww; maxX1 = w; minX = -w;
		} else if (maxX > w) {
			minX1 = -w; maxX1 = maxX - ww; maxX = w;
		}
	}
	out.push([minX, minY, maxX, maxY]);

	if (minX1) {
		out.push([minX1, minY, maxX1, maxY]);
	}
    return JSON.stringify(out);
};

var getParams = function(prop, dm, gmx) {
	var gmxEndPoints = gmx.gmxEndPoints || {};
	var pt = {
		endPoint: gmxEndPoints.checkVersion || '/Layer/CheckVersion.ashx',
        Name: prop.name,
        Version: isExistsTiles(prop) ? prop.LayerVersion : -1
    };
	if (dm && (prop.UseTiles === false || gmx.skipTiles === 'NotVisible' || gmx.needBbox || gmx.options.needBbox)) {
		var maxDateInterval = dm.getMaxDateInterval(),
			beginDate = maxDateInterval.beginDate || gmx.beginDate,
			endDate = maxDateInterval.endDate || gmx.endDate;
        if (beginDate) { pt.dateBegin = Math.floor(beginDate.getTime() / 1000); }
        if (endDate) { pt.dateEnd = Math.floor(endDate.getTime() / 1000); }
    }
    return pt;
};
var getRequestParams = function(layer) {
    var hosts = {},
        prop, hostName, dm, gmx;
    if (layer && layer._gmx) {
        if (layer.target instanceof L.gmx.DataManager) {
			layer = layer.target;
		}
        if (layer instanceof L.gmx.DataManager) {
			dm = layer;
			prop = dm.options;
		} else {
			// if (!layer._gmx) {return hosts;}
			prop = layer._gmx.properties;
			dm = layer._gmx.dataManager;
			gmx = layer._gmx;
		}
        hostName = prop.hostName || layer._gmx.hostName;
		hosts[hostName] = [getParams(prop, dm, gmx)];
    } else {
        var skipItems = {};
        for (var id in layers) {
            var obj = layers[id],
				isDataManager = obj instanceof L.gmx.DataManager;
            if (obj.options.chkUpdate || isDataManager) {
				dm = isDataManager ? obj : obj._gmx.dataManager;
                prop = isDataManager ? obj.options : obj._gmx.properties;
				gmx = isDataManager ? obj : obj._gmx;
                hostName = prop.hostName || obj._gmx.hostName;
                var pt = getParams(prop, dm, gmx),
                    key = pt.Name + pt.Version,
					valid = !skipItems[key] && (!prop.Temporal || pt.dateBegin);
                if (valid) {
                    if (hosts[hostName]) { hosts[hostName].push(pt); }
                    else { hosts[hostName] = [pt]; }
                }
                skipItems[key] = true;
            }
        }
    }
    return hosts;
};

var chkVersion = function (layer, callback) {
	if (typeof(layer) === 'string') {
		layer = layers[layer];
	}

	var map = layersVersion._map;
    var processResponse = function(res) {
        if (res && res.Status === 'ok' && res.Result) {
			var arr = res.Result,
				len = arr.length,
				count = 0,
				i, key, curLayer, id, item;

			if (layersVersion.needBbox) {
				for (i = 0; i < len; i++) {
					item = arr[i];
					id = item.name || item.properties.name;
					curLayer = null;
					if (layer && layer._gmx.properties.name === id) {
						curLayer = layer;
					} else {
						for (key in layers) {
							curLayer = layers[key];
							if (layer && layer === curLayer && 'updateVersion' in layer) { continue; }
							if (curLayer._gmx && curLayer._gmx.properties.name === id && 'updateVersion' in curLayer) {	// слои
								break;
							} else if (curLayer instanceof L.gmx.DataManager && curLayer.options.name === id) {	// источники данных
								break;
							}
						}
					}
					if (curLayer) {
						count += (curLayer.getDataManager ? curLayer.getDataManager() : curLayer).getNotLoadedVectorTiles(item);
					}
				}
				map.fire('needLoadTiles', {count: count});
				if (L.gmx.skipLoadTiles) {
					console.log('Skiped tiles: ', L.gmx.needLoadTiles);
					return;
				}
			}

            for (i = 0; i < len; i++) {
                item = arr[i];
				id = item.name || item.properties.name;

				if (layer && layer._gmx.properties.name === id && 'updateVersion' in layer) { layer.updateVersion(item); }
                for (key in layers) {
                    curLayer = layers[key];
					if (layer && layer === curLayer) { continue; }
                    if (curLayer._gmx && curLayer._gmx.properties.name === id && 'updateVersion' in curLayer) {	// слои
						curLayer.updateVersion(item);
					} else if (curLayer instanceof L.gmx.DataManager && curLayer.options.name === id) {	// источники данных
						curLayer.updateVersion(item.properties, item.tiles);
					}
                }
            }
        }
        // lastLayersStr = '';
        if (callback) { callback(res); }
    };

    if (document.body && !L.gmxUtil.isPageHidden()) {
        var hosts = getRequestParams(layer),
			workerParams = [],
			bboxStr = WORLDBBOX,
            chkHost = function(hostName, busyFlag) {
				var layersData = hosts[hostName];
				if (!layersData) {
					return;
				}
				var endPoint = layersData[0].endPoint || script,
					url = L.gmxUtil.protocol + '//' + hostName + endPoint,
                    layersStr = JSON.stringify(layersData);
				var ph = {WrapStyle: 'None', ftc: 'osm'};
				var params = 'WrapStyle=func&ftc=osm';
				// var params = 'WrapStyle=None&ftc=osm';
				if (layersVersion.needBbox) {
					var bbox = map.getBounds(),
						ne = bbox.getNorthEast(),
						sw = bbox.getSouthWest(),
						zoom = map.getZoom(),
						crs = L.Projection.Mercator;
					params += '&zoom=' + zoom;
					ph.zoom = zoom;
					if (map.options.srs == 3857) {
						params += '&srs=3857';
						ph.srs = 3857;
						crs = L.CRS.EPSG3857;
					}
					if (map.options.generalized === false) {
						params += '&generalizedTiles=false';
						ph.generalizedTiles = false;
					}
					if (!map.options.allWorld && (ne.lng - sw.lng) < 180) {
						var ts = L.gmxUtil.tileSizes[zoom],
							pb = {x: ts, y: ts};

						bboxStr = getBboxes(L.bounds(
							crs.project(sw)._subtract(pb),
							crs.project(ne)._add(pb)
						));
					}
					params += '&bboxes=' + bboxStr;
					ph.bboxes = bboxStr;
				}
				ph.layers = layersStr;
				params += '&layers=' + encodeURIComponent(layersStr);

				if (L.gmx.sendCmd) {
					workerParams.push({hostName: hostName, pars: ph});
					return;
				}
				if ('FormData' in window) {
						var onError = function(response) {
							console.log('Error: LayerVersion ', response);
							delete hostBusy[hostName];
							if (needReq[hostName] && !busyFlag) {
								delete needReq[hostName];
								chkHost(hostName, true);
							}
						}

						L.gmxUtil.requestJSONP(url + '?' + params, {}).then(function(json) {
							delete hostBusy[hostName];
							if (needReq[hostName] && !busyFlag) {
								delete needReq[hostName];
								hosts = getRequestParams();
								chkHost(hostName, true);
							} else {
								processResponse(json);
							}
						}, onError);

					hostBusy[hostName] = true;

                    var timeStamp = Date.now();
                    for (var key in layers) {
                        var it = layers[key];
                        var options = it._gmx || it.options;
                        if (options.hostName === hostName) { options._stampVersionRequest = timeStamp; }
                    }
                }
            };
        for (var hostName in hosts) {
			if (!hostBusy[hostName]) {
				chkHost(hostName);
			} else {
				needReq[hostName] = true;
			}
        }

		if (L.gmx.sendCmd && workerParams.length) {
			L.gmx.sendCmd('getLayersVersion', {
				pars: workerParams
			}).then(function() {
				// console.log('gggg', arguments);
			});
		}
    }
};

var layersVersion = {
    needBbox: false,

    addDataManager: function(dataManager) {
        var options = dataManager.options,
			id = options.name;
        if (id in layers) {
            return;
		}
		if (options.needBbox && !layersVersion.needBbox) {
			layersVersion.needBbox = options.needBbox;
		}
		dataManager.on('chkLayerUpdate', chkVersion.bind(dataManager));
		layers[id] = dataManager;
    },

    removeDataManager: function(dataManager) {
        var id = dataManager.options.name;
        if (id in layers) {
			dataManager.off('chkLayerUpdate', chkVersion.bind(dataManager));
			delete layers[id];
		}
    },

    remove: function(layer) {
		var layerID = layer.options.layerID;
		if (L.gmx.sendCmd) {
			L.gmx.sendCmd('toggleDataSource', {
				active: false,		// включить/выключить контроль источников
				hostName: layer.options.hostName,
				mapID: layer.options.mapID,
				layerID: layerID
			});
		}
        var _gmx = layer._gmx,
			pOptions = layer.options.parentOptions;
		if (pOptions) {
			var pId = pOptions.name;
			if (dataManagersLinks[pId]) {
				delete dataManagersLinks[pId][_gmx.properties.name];
				if (!Object.keys(dataManagersLinks[pId]).length) {
					layersVersion.removeDataManager(_gmx.dataManager);
					delete dataManagersLinks[pId];
				}
			}
		}
		if (!dataManagersLinks[layerID]) {
			delete layers[layerID];
			_gmx.dataManager.off('chkLayerUpdate', _gmx._chkVersion);
		}
    },

    add: function(layer) {
        var id = layer._gmx.layerID;
		this.remove(layer);

		if (L.gmx.sendCmd) {
			var opt = {
				active: true,		// включить/выключить контроль источников
				hostName: layer.options.hostName,
				mapID: layer.options.mapID,
				layerID: layer.options.layerID
			};
			var interval = layer._gmx.dataManager.getMaxDateInterval();
			if (interval.beginDate && interval.endDate) {
				opt.dInterval = [Math.floor(interval.beginDate.getTime() / 1000), Math.floor(interval.endDate.getTime() / 1000)];
			}
			L.gmx.sendCmd('toggleDataSource', opt);
		}
		// if (id in layers) {
            // return;
		// }

		var _gmx = layer._gmx,
			prop = _gmx.properties;
		if ('LayerVersion' in prop) {
			layers[id] = layer;
			_gmx._chkVersion = function () {
				chkVersion(layer);
			};
            _gmx.dataManager.on('chkLayerUpdate', _gmx._chkVersion);
			var pOptions = layer.options.parentOptions;
			if (pOptions) {
				var pId = pOptions.name;
				layersVersion.addDataManager(_gmx.dataManager);
				if (!dataManagersLinks[pId]) { dataManagersLinks[pId] = {}; }
				dataManagersLinks[pId][prop.name] = layer;
			}

            if (_gmx.needBbox && !layersVersion.needBbox) {
				layersVersion.needBbox = _gmx.needBbox;
			}
			layersVersion.start();
            // if (!_gmx._stampVersionRequest || _gmx._stampVersionRequest < Date.now() - 19000 || !isExistsTiles(prop)) {
				layersVersion.now();
            // }
        }
    },

    chkVersion: chkVersion,

    now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec) {
        if (msec) { delay = msec; }
        layersVersion.stop();
        intervalID = setInterval(chkVersion, delay);
    }
};

if (!L.gmx) { L.gmx = {}; }
L.gmx.layersVersion = layersVersion;

L.gmx.VectorLayer.include({
    updateVersion: function (layerDescription) {
        if (layerDescription) {
            var gmx = this._gmx;
            if (layerDescription.geometry) {
                gmx.geometry = layerDescription.geometry;
            }
            if (layerDescription.properties) {
				var out = {versionChanged: layerDescription.properties.LayerVersion !== gmx.properties.LayerVersion};
                L.extend(gmx.properties, layerDescription.properties);
                gmx.properties.currentTiles = layerDescription.tiles;
                gmx.properties.GeoProcessing = layerDescription.properties.GeoProcessing;	// TODO: проверка изменения версии
                gmx.rawProperties = gmx.properties;
                this.fire('versionchange', out);
            }
			if (!gmx.dataSource && gmx.dataManager) {
				gmx.dataManager.updateVersion(gmx.rawProperties, layerDescription.tiles);
			}
        }
    }
});
L.Map.addInitHook(function () {
	layersVersion._map = this;
	var map = this,
		prev = {};
	this.on('moveend', function () {
		var z = map.getZoom(),
			center = map.getPixelBounds().getCenter();
		if (z !== prev.z || prev.center.distanceTo(center) > 128) {
			chkVersion();
			prev.z = z;
			prev.center = center;
		}
	});
});

})();
