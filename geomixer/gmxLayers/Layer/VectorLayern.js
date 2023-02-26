// import {gmxAPIutils} from '../Utils.js';
// import ScreenVectorTile from './ScreenVectorTile.js';

L.gmx.VectorLayer = L.GridLayer.extend({
    initFromDescription: function(ph) {
        var gmx = this._gmx || {};

        gmx.properties = ph.properties;
        gmx.geometry = ph.geometry;
		this._gmx = gmx;
		this._needSend = [];
		// this.options.zIndexOffset = 100000;
		// this.options.zIndex = 1;
        return this;
	},
	getGmxProperties: function() {
		return this._gmx.properties;
	},
	_sendQueue: function() {
		if (this._map) {
			let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom: this._map.getZoom()};
			let opt = {
				cmd: 'getTile',
				hostName: this.options.hostName,
				layerID: this.options.layerID,
				mapPos: mapPos
			};
			let done = this._tileReady;
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
				L.gmx.vw._sendCmd('getTile', opt).then(res => {
					tile.getContext('bitmaprenderer').transferFromImageBitmap(res.bitmap);
					tile.classList.remove('createTile');
					done('', tile);
				});
			});
		}

		// let	mapPos = {};
// console.log('_sendQueue', this._needSend, mapPos, this._tileZoom);
		this._needSend = [];
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
	createTile: function(coords, done) {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x;
		tile.height = size.y;
		this._needSend.push({tile, coords, done});
		if (this._timerSend) cancelIdleCallback(this._timerSend);
		this._timerSend = requestIdleCallback(this._sendQueue.bind(this), {timeout: 250});
		return tile;
	},
});
