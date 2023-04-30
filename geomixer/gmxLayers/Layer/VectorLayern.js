// import {gmxAPIutils} from '../Utils.js';
// import ScreenVectorTile from './ScreenVectorTile.js';

L.gmx.VectorLayer = L.GridLayer.extend({
    initFromDescription: function(ph) {
        var gmx = this._gmx || {};

        gmx.properties = ph.properties;
        gmx.geometry = ph.geometry;
gmx.reqName = gmx.properties.LayerID;
		this._gmx = gmx;
		this._needSend = true;
		// this._needSend = [];

		// this.options.updateWhenZooming = false;
		// this.options.zIndexOffset = 100000;
		// this.options.zIndex = 1;
		this.on('loading tileloadstart', this.__tileloadstart, this);

        return this;
	},
	getGmxProperties: function() {
		return this._gmx.properties;
	},
    setDateInterval: function (beginDate, endDate) {
        var gmx = this._gmx;

		var props = gmx.properties;
        if (gmx.dateBegin && gmx.dateEnd) {
			beginDate = gmx.dateBegin;
			endDate = gmx.dateEnd;
		}

        //check that something changed
        if (!gmx.beginDate !== !beginDate ||
            !gmx.endDate !== !endDate ||
            (beginDate && gmx.beginDate && (gmx.beginDate.valueOf() !== beginDate.valueOf())) ||
            (endDate && gmx.endDate && (gmx.endDate.valueOf() !== endDate.valueOf()))
        ) {
			var msecDay = 24 * 3600 * 1000;
            if (props.minShownPeriod && endDate) {
                beginDate = new Date(endDate.valueOf() - msecDay * props.minShownPeriod);
            } else if (props.maxShownPeriod && beginDate) {
                beginDate = new Date(Math.max(beginDate.valueOf(), endDate.valueOf() - msecDay * props.maxShownPeriod));
            }

            gmx.beginDate = beginDate;
            gmx.endDate = endDate;
/*
            var observer = null,
				dataManager = gmx.dataManager;
            for (var key in this._tiles) {
				this._tiles[key].loaded = 0;
				observer = this._tiles[key].observer;
				if (observer) {
					observer.setDateInterval(beginDate, endDate);
				}
            }
            observer = dataManager.getObserver('_Labels');
            if (observer) {
                observer.setDateInterval(beginDate, endDate);
            }
			if (gmx.skipTiles === 'NotVisible' || gmx.needBbox || gmx.properties.UseTiles === false) {
				if (!gmx.needBbox) {
					gmx.properties.LayerVersion = -1;
					dataManager.setOptions({LayerVersion: -1});
				}
				if (this._map) {
					L.gmx.layersVersion.now();
				}
			}
*/
            // this.redraw();
			// if (this._timerSend) cancelIdleCallback(this._timerSend);
			// this._timerSend = 
// this._tileZoom = 0;
	// this._needSend = this._needSendLast || [];

// this._sendQueue();
		// if (this._timerSend) cancelIdleCallback(this._timerSend);
		// this._timerSend = requestIdleCallback(this._sendQueue.bind(this), {timeout: 50});

// console.log('setDateInterval', this._needSend, this._tileZoom);
			// requestIdleCallback(this.redraw.bind(this), {timeout: 50});
			this.fire('dateIntervalChanged');
        }

		var map = this._map;
		if (map) {
			map.removeLayer(this);
			map.addLayer(this);
		}
        return this;
    },

    // redraw: function() {
    // },

    getDateInterval: function() {
        return {
            beginDate: this._gmx.beginDate,
            endDate: this._gmx.endDate
        };
    },
    repaint: function() {
		if (this._timerSend) cancelIdleCallback(this._timerSend);
		this._timerSend = requestIdleCallback(this.__sendQueues.bind(this, false), {timeout: 250});
    },

	__tileloadstart: function(ev) {
		if (this._timerSend) cancelIdleCallback(this._timerSend);
		this._timerSend = requestIdleCallback(this.__sendQueues.bind(this, true), {timeout: 250});
// console.log('tileloadstart', ev.tile, ev.tile instanceof OffscreenCanvas);
	},
	// _onOpaqueTile: function(tile) {
// console.log('_onOpaqueTile', tile.current, tile);
	// },
	__getQueues: function() {
		const queues = [];
		for (const key in this._tiles) {
			const c = this._tiles[key];
			if (c.current) {
				let coords = c.coords;
				queues.push({
					key,
					coords: this._wrapCoords(coords),
					nwcoords: coords,
				});
			}
		}
		return queues;
	},
	__reCheckTiles: function(zoom, flagLoad) {
		for (const key in this._tiles) {
			let it = this._tiles[key];
			if (it.coords.z === zoom) {
				// if (flagLoad === true) this._tileReady(it.coords, '', it.el);

				// it.el.classList.remove('createTile');
				// it.el.classList.add('leaflet-tile-loaded');
				continue;
			}
			this._removeTile(key);
		}
	},
	__sendQueues: function(flagLoad) {
// console.log('_sendQueue0', flagLoad, this._needSend, this._gmx.properties);
		if (!this._needSend) {
			if (this._timerSend) cancelIdleCallback(this._timerSend);
			this._timerSend = requestIdleCallback(this.__sendQueues.bind(this, flagLoad), {timeout: 250});
				this._needSend = true;
			return;
		}
		if (!this._map) return;
		let zoom = this._map.getZoom();
			let _tileZoom = this._tileZoom;
		if (_tileZoom !== zoom) return;
		const queues = this.__getQueues();
		if (!queues.length) return;
		// L.gmx.Requests({url: this._gmx.reqName, remove: true});
// performance.mark('start');
		
		let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom };
		this._needSend = false;
		let transfer = [];
		let opt = {
			cmd: 'getTiles',
			flagLoad: flagLoad || false,
			queues,
			zIndex: (this.options.zIndexOffset || 100000) + (this.options.zIndex || 1),
			z: _tileZoom,
			hostName: this.options.hostName,
			layerID: this.options.layerID,
			mapPos: mapPos
		};
		opt.transfer = transfer;
			let _this = this;
			L.gmx.Requests({url: this._gmx.reqName});
// console.log('_sendQueue', opt);
			L.gmx.vw._sendCmd('getTiles', opt).then(res => {
				_this._needSend = true;
// console.log('_sendQueue', _this._tileZoom, zoom);
				// if (_this._tileZoom !== zoom) return;

// console.log('_sendQueue1', _this._map.getZoom(), opt, _this._tileZoom, res);
				res.queues.forEach(it => {
					let _ns = _this._tiles[it.key];
					if (_ns && _ns.el) {
						let tile = _ns.el;
						tile.classList.add('leaflet-tile-loaded');
						if (it.bitmap) {
							tile.getContext('bitmaprenderer').transferFromImageBitmap(it.bitmap);
										// _this._level.el.appendChild(tile);

						}
						// else if (tile.parentNode) tile.parentNode.remove(tile);
						// tile.classList.remove('createTile');
						// tile.classList.add('leaflet-tile-loaded');
						
						// if (flagLoad === true) _this._tileReady(it.nwcoords, '', tile);
					// } else {
						// console.log('t skip', it, tiles);
					}
					
				});
				_this.__reCheckTiles(zoom, flagLoad);

// console.log('ssss', flagLoad, _this._fadeFrame, _this._tiles);
				// _this._removeTilesAtZoom(_tileZoom);
				// if (flagLoad === false) {
		// for (const key in _this._tiles) {
			// let it = _this._tiles[key];
			// if (it.coords.z === res.z) {
				// if (flagLoad === true) _this._tileReady(it.coords, '', it.el);
				// it.el.classList.remove('createTile');
				// it.el.classList.add('leaflet-tile-loaded');
				// continue;
			// }
			// _this._removeTile(key);
		// }
		// }
		// this._map._fadeAnimated = false;
		// _this._pruneTiles();

				// if (flagLoad === false) _this._pruneTiles();
// console.log('ssss__', flagLoad, _this._noPrune, Object.keys(_this._levels));
// console.log('getTile1', res);
				L.gmx.Requests({url: this._gmx.reqName, remove: true});
    // performance.mark('end');
 // console.log('duration', performance.measure('time', 'start', 'end').duration, performance.getEntriesByType('resource'), res);
 // console.log('duration', performance.measure('time', 'start', 'end').duration, performance.getEntriesByType('measure'), res);
		});
	},

	/* переопределенные методы GridLayer */
    _updateZIndex: function () {
        if (this._container) {
            var options = this.options,
                zIndex = options.zIndex || 1,
                zIndexOffset = options.zIndexOffset || 100000;

           this._container.style.zIndex = zIndexOffset + zIndex;
        }
	   this.fire('zindexupdated')
	},

	onAdd(map) {
		this._initContainer();

		this._levels = {};
		this._tiles = {};

		this._resetView(); // implicit _update() call
		map.on('zoomstart zoomend', ev => {
			this._needSend = ev.type === 'zoomend';
// console.log('zoomstart', ev.type, this);
			if (ev.type === 'zoomend') this.__tileloadstart();
		}, this);

	},
	onRemove(map) {
		this._removeAllTiles();
		L.DomUtil.remove(this._container);
		map._removeZoomLimit(this);
		this._container = null;
		this._tileZoom = undefined;
	},
	// _addTile(coords, container) {
		// L,GridLayer.prototype.call(this, coords, container);
		// let key = this._tileCoordsToKey(coords);
	// },
	// _initTile(tile) {
		// DomUtil.addClass(tile, 'leaflet-tile');

		// const tileSize = this.getTileSize();
		// tile.style.width = `${tileSize.x}px`;
		// tile.style.height = `${tileSize.y}px`;

		// tile.onselectstart = Util.falseFn;
		// tile.onmousemove = Util.falseFn;
	// },
	createTile: function(coords, done) {
		// var tile = new OffscreenCanvas(256, 256);
// this.performance = Performance.now();
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x; tile.height = size.y;
					done('', tile);
						// tile.classList.remove('createTile');
						// tile.classList.add('leaflet-tile-loaded');
		// tile = tile.transferControlToOffscreen();
tile.addEventListener("contextlost", (event) => {
  // event.preventDefault();
  console.log("contextlost", event);
});
tile.addEventListener("contextrestored", (event) => {
  // event.preventDefault();
  console.log("contextrestored", event);
});
		// this._needSend.push({tile, coords, done});
		// if (this._timerSend) cancelIdleCallback(this._timerSend);
		// this._timerSend = requestIdleCallback(this._sendQueue.bind(this), {timeout: 250});
// console.log('createTile', coords, tile);
		return tile;
	},

	_updateOpacity() {
	},

		/*
	_update(center) {
		const map = this._map;
		if (!map) { return; }
		const zoom = this._clampZoom(map.getZoom());

		if (center === undefined) { center = map.getCenter(); }
		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

		const pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.getCenter(),
		    queue = [],
		    margin = this.options.keepBuffer,
		    noPruneRange = new L.Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
		                              tileRange.getTopRight().add([margin, -margin]));

		// Sanity check: panic if the tile range contains Infinity somewhere.
		if (!(isFinite(tileRange.min.x) &&
		      isFinite(tileRange.min.y) &&
		      isFinite(tileRange.max.x) &&
		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

		for (const key in this._tiles) {
			const c = this._tiles[key].coords;
			if (c.z !== this._tileZoom || !noPruneRange.contains(new L.Point(c.x, c.y))) {
				this._tiles[key].current = false;
			}
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

		// create a queue of coordinates to load tiles from
		for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
				const coords = new L.Point(i, j);
				coords.z = this._tileZoom;

				if (!this._isValidTile(coords)) { continue; }

				const tile = this._tiles[this._tileCoordsToKey(coords)];
				if (tile) {
					tile.current = true;
				} else {
					queue.push(coords);
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort((a, b) => a.distanceTo(tileCenter) - b.distanceTo(tileCenter));

		if (queue.length !== 0) {
			// if it's the first batch of tiles to load
			if (!this._loading) {
				this._loading = true;
				// @event loading: Event
				// Fired when the grid layer starts loading tiles.
				this.fire('loading');
			}

			// create DOM fragment to append tiles in one batch
			const fragment = document.createDocumentFragment();

			for (let i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment);
			}

			this._level.el.appendChild(fragment);
		}
	},
*/
});
