// import {gmxAPIutils} from '../Utils.js';
// import ScreenVectorTile from './ScreenVectorTile.js';

L.gmx.VectorLayer = L.GridLayer.extend({
    initFromDescription: function(ph) {
        var gmx = this._gmx || {};

        gmx.properties = ph.properties;
        gmx.geometry = ph.geometry;
		this._gmx = gmx;
		// this.options.zIndexOffset = 100000;
		// this.options.zIndex = 1;
        return this;
	},
	getGmxProperties: function() {
		return this._gmx.properties;
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
	// setZIndex: function(nm) {
	// },
	// _update: function(center) {
		// this._map._animateToZoom

		// this._gmx.mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom: this._map.getZoom()};
        // L.GridLayer.prototype._update.call(this, center);
	// },
	createTile: function(coords, done) {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x;
		tile.height = size.y;
			// console.log('__createTile', coords.z, this._tileZoom);
					this.__createTile(coords, done, tile);
/*
		this._map.once('moveend', () => {
			if (this._map) {
				let	zoom = this._map.getZoom();
			// console.log('__createTile', coords, zoom);
				if (zoom === coords.z) {
					let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom};
					this.__createTile(coords, done, tile, mapPos);
				} else {
					done('skip', tile);
				}
			}
		});
		*/
		return tile;
	},
	__createTile: function(coords, done, tile) {
		const key = this._tileCoordsToKey(coords);
		let	mapPos = {bbox: L.gmxUtil.getBboxes(this._map), zoom: this._tileZoom};
		// this.__promises = this.__promises || {};
		// new Promise((resolve, reject) => {
			// this.__promises[key] = resolve;
			let opt = {
				cmd: 'getTile',
				hostName: this.options.hostName,
				layerID: this.options.layerID,
				queue: [coords],
				mapPos: mapPos,
				z: coords.z
			};

			L.gmx.vw._sendCmd('getTile', opt).then(res => {
				// console.log("getTile------- ", res);
				tile.getContext('bitmaprenderer').transferFromImageBitmap(res.bitmap);
				done('', tile);
			});
		// });
	}
});
