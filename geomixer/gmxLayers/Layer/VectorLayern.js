// import {gmxAPIutils} from '../Utils.js';
// import ScreenVectorTile from './ScreenVectorTile.js';

L.gmx.VectorLayer = L.GridLayer.extend({
    initFromDescription: function(ph) {
        var gmx = this._gmx || {};

        gmx.properties = ph.properties;
        gmx.geometry = ph.geometry;
gmx.reqName = gmx.properties.LayerID;
		this._gmx = gmx;
		this._needSend = [];
		// this.options.zIndexOffset = 100000;
		// this.options.zIndex = 1;
		this.on('tileloadstart', this.__tileloadstart, this);

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
		this._needSend = Object.values(this._tiles).reduce((a, c) => {
			if (c.current) {
				let coords = c.coords;
				a.push({
					key: this._tileCoordsToKey(coords),
					coords: this._wrapCoords(coords),
					nwcoords: coords,
					tile: c.el,
				});
			}
			return a;
		}, []);
		if (this._timerSend) cancelIdleCallback(this._timerSend);
		this._timerSend = requestIdleCallback(this.__sendQueues.bind(this), {timeout: 250});
    },

	__tileloadstart: function(ev) {
		let coords = ev.coords;
		this._needSend.push({
			key: this._tileCoordsToKey(coords),
			coords: this._wrapCoords(coords),
			nwcoords: coords,
			tile: ev.tile,
			// done
		});
		if (this._timerSend) cancelIdleCallback(this._timerSend);
		this._timerSend = requestIdleCallback(this.__sendQueues.bind(this, true), {timeout: 250});
				// key = this._tileCoordsToKey(coords);
// console.log('tileloadstart', this._needSend);
	},
	__sendQueues: function(flag) {
		if (this._map) {
			L.gmx.Requests({url: this._gmx.reqName});
			let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom: this._map.getZoom()};
			let opt = {
				cmd: 'getTiles',
				queues: [],
				hostName: this.options.hostName,
				layerID: this.options.layerID,
				mapPos: mapPos
			};
			let cnt = this._needSend.length;
			this._needSend.forEach((it, nm) => {
				let coords = it.coords;
				let tile = it.tile;
				// let done = it.done;
				// opt.queue = [it.coords];
				opt.z = it.coords.z;
				const key = this._tileCoordsToKey(coords);
				const zKey = key + '_' + nm;
				opt.queues.push({key, nm, zKey, coords});
				tile.key = key;
				tile.classList.add(zKey);
				tile.classList.add('createTile');
			});
// console.log('_sendQueue', cnt, opt);
			let _this = this;
			let _needSendLast = this._needSend;
			let _cont = {};
			L.gmx.vw._sendCmd('getTiles', opt).then(res => {
console.log('_sendQueue', res);
				res.queues.forEach((it, i) => {
					let _ns = _needSendLast[i];
					if (_ns) {
						let tile = _ns.tile;
						if (it.bitmap) tile.getContext('bitmaprenderer').transferFromImageBitmap(it.bitmap);
						tile.classList.remove('createTile');
						// _needSendLast[i].done('',tile);
						// _ns.done('', tile);
						if (flag === true) _this._tileReady(_ns.nwcoords, '', tile);
						// L.DomUtil.addClass(tile, 'leaflet-tile-loaded');

					} else {
						console.log('t skip', it, tiles);
					}
					
				});
// console.log('getTile1', res);
				L.gmx.Requests({url: this._gmx.reqName, remove: true});
			});
			this._needSendLast = this._needSend;
// console.log('_sendQueue', this._needSend, this._tileZoom);
		}

		// let	mapPos = {};
		this._needSend = [];
	},
/*
	_sendQueue_: function() {
		if (this._map) {
			let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom: this._map.getZoom()};
			let opt = {
				cmd: 'getTile',
				hostName: this.options.hostName,
				layerID: this.options.layerID,
				mapPos: mapPos
			};
			let cnt = this._needSend.length;
			this._needSend.forEach(it => {
				let coords = it.coords;
				let tile = it.tile;
				let done = it.done;
				opt.queue = [it.coords];
				opt.z = it.coords.z;
				const key = this._tileCoordsToKey(coords);
				tile.key = key;
				tile.classList.add(key);
				tile.classList.add('createTile');
// console.log('getTile', opt);
				L.gmx.vw._sendCmd('getTile', opt).then(res => {
					if (res.bitmap) tile.getContext('bitmaprenderer').transferFromImageBitmap(res.bitmap);
					tile.classList.remove('createTile');
					done('', tile);
					cnt--;
// console.log('getTile1', res);
if(!cnt) L.gmx.Requests({url: this._gmx.reqName, remove: true});
				});
			});
			this._needSendLast = this._needSend;
// console.log('_sendQueue', this._needSend, this._tileZoom);
		}

		// let	mapPos = {};
		this._needSend = [];
	},
*/
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
	// _addTile(coords, container) {
		// L,GridLayer.prototype.call(this, coords, container);
		// let key = this._tileCoordsToKey(coords);
	// },
	createTile: function(coords, done) {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x; tile.height = size.y;
		// this._needSend.push({tile, coords, done});
		// if (this._timerSend) cancelIdleCallback(this._timerSend);
		// this._timerSend = requestIdleCallback(this._sendQueue.bind(this), {timeout: 250});
// console.log('createTile', coords, tile);
		return tile;
	},
});
