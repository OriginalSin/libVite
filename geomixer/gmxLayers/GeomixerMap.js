//Helper class, that represents layers of single Geomixer's map
//Creates layers from given map description
var gmxMap = {
    layers: [],
    layersByTitle: {},
    layersByID: {},
    layersByTitle: {},
    options: {},
    properties: {},
    rawTree: {},
    notLayerTypes: {},
	addLayersToMap: (res, opt) => {
		gmxMap.rawTree = res;
		gmxMap.options = opt;
		gmxMap.properties = res.properties;
		gmxMap.iterateNode(res);
		gmxMap.leafletMap = L.gmx.map;
			// console.log('addLayersToMap', res, opt, gmxMap);
		return gmxMap;
	},
    iterateNode: (treeInfo) => {
        let iterate = (node) => {
			let arr = node.children || [];
			arr.forEach(it => {
                if (it.type === 'group') {
                    iterate(it.content);
                } else if (it.type === 'layer') {
					gmxMap.createLayer(it.content);
                }
            });
        };

        treeInfo && iterate(treeInfo);
	},
    createLayer: (layerInfo, opt) => {
		const mapProps = gmxMap.properties;
		const props = layerInfo.properties;
		const options = {
			mapID: mapProps.mapID,
			hostName: gmxMap.options.hostName,
			sessionKey: gmxMap.options.sessionKey,
			layerID: props.name
		};

		props.hostName = gmxMap.options.hostName;
		props.srs = gmxMap.options.srs;

		const type = props.ContentID || props.type,
			meta = props.MetaProperties || {},
			layerOptions = L.extend(options, opt);

		if (type in L.gmx._layerClasses) {
			gmxMap.addLayer(L.gmx.createLayer(layerInfo, layerOptions));
		} else {
			gmxMap.notLayerTypes[type] = gmxMap.notLayerTypes[type] || [];
			gmxMap.notLayerTypes[type].push({
				info: layerInfo,
				options: layerOptions
			});
		}
    },

	addLayer: function(layer) {
		const props = layer.getGmxProperties();
		// const props = {};

		gmxMap.layers.push(layer);
		if (layer.options) layer.options.zIndex = gmxMap.layers.length;
		gmxMap.layersByTitle[props.title] = layer;
		gmxMap.layersByID[props.name] = layer;
		// this.fire('layeradd', {layer: layer});
		if (props.visible) {
			L.gmx.map.addLayer(layer);
		}
		return layer;
	},
    setDateIntervals: (dt) => {
		L.gmx.vw._sendCmd('setDateIntervals', {dt}).then(res => {
			console.log('setDateIntervals res', res)
		});

		let arr = gmxMap.layers.filter(it => it._gmx && it._gmx.properties.Temporal).map(layer => {
			layer.setDateInterval(new Date(dt.begin * 1000), new Date(dt.end * 1000));
			return layer;
		});
        console.log('setDateIntervals', dt, arr)

	},
/*
    iterateLayers: function(treeInfo, callback) {
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
    },
    initialize: function(mapInfo, commonLayerOptions) {
		this.layers = [];
		this.layersByTitle = {};
		this.layersByID = {};
		this.dataManagers = {};
		this.options = commonLayerOptions;

		this.properties = L.extend({}, mapInfo.properties);
		this.properties.BaseLayers = this.properties.BaseLayers ? JSON.parse(this.properties.BaseLayers) : [];
		this.rawTree = mapInfo;
		this.layersCreated = this.layersCreatePromise(mapInfo);
	},

	layersCreatePromise: function(mapInfo) {
		return new Promise(function(resolve) {
			var mapID = mapInfo.properties.name,
				_this = this,
				commonOptions = this.options,
				_skipTiles = this.options.skipTiles || 'All',
				_ftc = this.options.ftc || 'osm',
				_srs = this.options.srs || 3857,
				missingLayerTypes = {},
				dataSources = {};

			L.gmx.gmxMapManager.iterateLayers(mapInfo, function(layerInfo) {
				var props = layerInfo.properties,
					options = {
						mapID: mapID,
						sessionKey: mapInfo.properties.sessionKey,
						layerID: props.name
					};

				props.hostName = mapInfo.properties.hostName;
				if (mapInfo.srs) {
					props.srs = mapInfo.srs;
				}

				var type = props.ContentID || props.type,
					meta = props.MetaProperties || {},
					layerOptions = L.extend(options, commonOptions);

				if (props.styles && !props.gmxStyles) {
					props.gmxStyles = L.gmx.StyleManager.decodeOldStyles(props);
				}
				if (props.dataSource || 'parentLayer' in meta) {      	// Set dataSource layer
					layerOptions.parentLayer = props.dataSource || '';
					if ('parentLayer' in meta) {      	// todo удалить после изменений вов вьювере
						layerOptions.parentLayer = meta.parentLayer.Value || '';
					}
					if ('hostName' in meta) {
						layerOptions.hostName = meta.hostName.Value || '';
					}
					if ('apiKey' in meta) {
						layerOptions.apiKey = meta.apiKey.Value || '';
					}
					dataSources[options.layerID] = {
						info: layerInfo,
						options: layerOptions
					};
				} else if (type in L.gmx._layerClasses) {
					_this.addLayer(L.gmx.createLayer(layerInfo, layerOptions));
				} else {
					missingLayerTypes[type] = missingLayerTypes[type] || [];
					missingLayerTypes[type].push({
						info: layerInfo,
						options: layerOptions
					});
				}
			});

			//load missing layer types
			var loaders = [];
			for (var type in missingLayerTypes) {
				loaders.push(L.gmx._loadLayerClass(type).then(function (type) {
					var it = missingLayerTypes[type];
					for (var i = 0, len = it.length; i < len; i++) {
						_this.addLayer(L.gmx.createLayer(it[i].info, it[i].options));
					}
				}.bind(null, type)));
			}
			var hosts = {}, host, id, it;
			for (id in dataSources) {
				it = dataSources[id];
				var opt = it.options,
					pId = opt.parentLayer,
					pLayer = this.layersByID[pId];
				if (pLayer) {
					it.options.parentOptions = pLayer.getGmxProperties();
					it.options.dataManager = this.dataManagers[pId] || new L.gmx.DataManager(it.options.parentOptions, true);
					this.dataManagers[pId] = it.options.dataManager;
					this.addLayer(L.gmx.createLayer(it.info, it.options));
				} else {
					host = opt.hostName;
					if (!hosts[host]) { hosts[host] = {}; }
					if (!hosts[host][pId]) { hosts[host][pId] = []; }
					hosts[host][pId].push(id);
				}
			}
			for (host in hosts) {
				var arr = [],
					prefix = L.gmxUtil.protocol + '//' + host;
				for (id in hosts[host]) {
					arr.push({Layer: id});
				}
				if (window.apiKey && host === 'maps.kosmosnimki.ru') {
					loaders.push(L.gmx.gmxSessionManager.requestSessionKey(host, window.apiKey));
				}
				var endPoints = this.options.gmxEndPoints || {};
				var endPoint = endPoints.layerProps || '/Layer/GetLayerJson.ashx';
				loaders.push(L.gmxUtil.requestJSONP(prefix + endPoint, {
						WrapStyle: 'func',
						skipTiles: _skipTiles,
						srs: _srs,
						ftc: _ftc,
						Layers: JSON.stringify(arr)
					},
					{
						host: host,
						ids: hosts[host]
					}
					).then(function(json, opt) {
						if (json && json.Status === 'ok' && json.Result) {
							json.Result.forEach(function(it) {
								var props = it.properties,
									pId = props.name;

								props.tiles = [];
								props.skipTiles = _skipTiles;
								props.srs = _srs;
								props.ftc = _ftc;
								props.hostName = host;

								var dataManager = _this.addDataManager(it);
								if (opt && opt.ids && opt.ids[pId]) {
									opt.ids[pId].forEach(function(id) {
										var pt = dataSources[id];
										pt.options.parentOptions = it.properties;
										pt.options.dataManager = dataManager;
										pt.info.properties.tiles = [];	// Шумилов должен убрать
										pt.info.properties.skipTiles = _skipTiles;
										pt.info.properties.srs = _srs;
										pt.info.properties.ftc = _ftc;
										_this.addLayer(L.gmx.createLayer(pt.info, pt.options));
									});
								}
							});
						} else {
							console.info('Error: loading ', prefix + endPoint, json.ErrorInfo);
							if (opt && opt.ids) {
								for (var pId in opt.ids) {
									opt.ids[pId].forEach(function(id) {
										_this.addLayer(new L.gmx.DummyLayer(dataSources[id].info.properties));
									});
								}
							}
						}
					}));
			}
			Promise.all(loaders).then(resolve);
		}.bind(this));
	},

	addDataManager: function(it) {
		var pid = it.properties.name;
		if (!this.dataManagers[pid]) {
			this.dataManagers[pid] = new L.gmx.DataManager(it.properties);
		}
		return this.dataManagers[pid];
	},
	getDataManager: function(id) {
		return this.dataManagers[id];
	},

	addLayer: function(layer) {
		var props = layer.getGmxProperties();

		this.layers.push(layer);
		this.layersByTitle[props.title] = layer;
		this.layersByID[props.name] = layer;
		this.fire('layeradd', {layer: layer});

		return this;
	},

	removeLayer: function(layer) {
		var props = layer.getGmxProperties();

		for (var i = 0; i < this.layers.length; i++) {
			if (this.layers[i].getGmxProperties().name === props.name) {
				this.layers.splice(i, 1);
				break;
			}
		}

		delete this.layersByTitle[props.title];
		delete this.layersByID[props.name];
		this.fire('layerremove', {layer: layer});

		return this;
	},
*/
};
L.gmx = L.gmx || {};
L.gmx.gmxMap = gmxMap;
