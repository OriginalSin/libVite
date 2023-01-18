// import {gmxAPIutils} from '../Utils.js';
// import ScreenVectorTile from './ScreenVectorTile.js';

L.gmx.VectorLayer = L.GridLayer.extend({
    initFromDescription: function(ph) {
        var gmx = this._gmx || {};

        gmx.properties = ph.properties;
        gmx.geometry = ph.geometry;
		this._gmx = gmx;
        return this;
	},
	getGmxProperties: function() {
		return this._gmx.properties;
	},
	createTile: function(coords, done) {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x;
		tile.height = size.y;

		this.__createTile(coords, done, tile);
		return tile;
	},
	__createTile: function(coords, done, tile) {
		const key = this._tileCoordsToKey(coords);
		this.__promises = this.__promises || {};
		new Promise((resolve, reject) => {
			this.__promises[key] = resolve;
			let opt = {
				cmd: 'getTile',
				hostName: this.options.hostName,
				layerID: 'E7882FCE9E55484AB370D36CD7210648',
				queue: [coords],
				z: coords.z
			};
			L.gmx.vw._sendCmd('getTile', opt).then(res => {
				// console.log("getTile------- ", res);
				tile.getContext('bitmaprenderer').transferFromImageBitmap(res.bitmap);
				done('', tile);
			});
 		});
	}
});
