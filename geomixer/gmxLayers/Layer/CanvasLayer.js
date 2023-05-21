L.gmx.VectorLayerFull = L.Layer.extend({
	initialize: function (options) {
		// options.pane = 'tilePane';
		// options.pane = 'gmxLayers';
		L.setOptions(this, options);
	},

	initFromDescription: function (layerInfo) {
		this.options.layerInfo = layerInfo;
        var gmx = this._gmx || {};

        gmx.properties = layerInfo.properties;
        gmx.geometry = layerInfo.geometry;
		this.options.id = gmx.properties.LayerID;
// gmx.reqName = gmx.properties.LayerID;
		this._gmx = gmx;
		return this;
	},
	getGmxProperties: function () {
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
			this.fire('dateIntervalChanged');
        }
console.log('setDateInterval', gmx);
		L.gmx.vw._sendCmd({
			id: props.name,
			begin: gmx.beginDate.getTime() / 1000,
			end: gmx.endDate.getTime() / 1000,
			cmd: 'setDateInterval'
		// }).then(console.log);
		}).then(it => {
console.log('setDateIff fffffffff nterval', it);
		});
		if (this._map) {
			this._rePaint();
		}
		// if (this._map) requestAnimationFrame(this._rePaint.bind(this), {timeout: 150});

		// var map = this._map;
		// if (map) {
			// map.removeLayer(this);
			// map.addLayer(this);
		// }
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
	onRemove: function (map) {
		this._div.parentNode.removeChild(this._div);
		console.log('onRemove:', map);
		// this._map = null;
	},

	onAdd: function (map) {
		// if (!this._canvas) {
			this._div = L.DomUtil.create('div', 'leaflet-image-layer gmxLayers', this.getPane());
			this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay canv', this._div);
			this._setSize();
		// }

		// map.on('resize', this._setSize, this);
		map.on('viewreset', this._viewreset, this);

		requestAnimationFrame(this._rePaint.bind(this), {timeout: 150});
		// this._rePaint();
	},

	setFilter: function (data, type) {
		this.options.dataManager.postMessage({
			cmd: 'setFilter',
			id: this.options.layerId,
			type,
			data
		});
	},

	_rePaint: function () {
/*
		const map = this._map,
			zoom = map.getZoom(),
			center = map.getCenter(),
			origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round(),
		// const scale = this._map.getZoomScale(zoom, level.zoom),
		    translate = origin.subtract(map._getNewPixelOrigin(center, zoom)).round();
*/
		const pos = L.DomUtil.getPosition(this._map.getPane('mapPane'));
// console.log('pos _____:', pos);
		const pixelBounds = this._getTiledPixelBounds(),
		    tileRange = this._pxBoundsToTileRange(pixelBounds);
		L.gmx.vw._sendCmd({id: this.options.id, tileRange, cmd: 'drawScreen'} ).then(res1 => {
			// console.log('_rePaint res1_____:', res1);
			this._canvas.getContext('bitmaprenderer').transferFromImageBitmap(res1.bitmap);
			L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);

			// this._canvas.style.display = 'block';

		});
	},

	_pxBoundsToTileRange(bounds) {
		const tileSize = {x: 256, y: 256};
		return new L.Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	},

	_getTiledPixelBounds() {
		const map = this._map,
		    mapZoom = map.getZoom(),
		    _tileZoom = mapZoom,
		    pixelCenter = map.project(map.getCenter(), _tileZoom).floor(),
		    halfSize = map.getSize().divideBy(2);

		return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	},

	getEvents: function () {
		let events = {
			// movestart: this._movestart,
			moveend: this._rePaint,
			// zoomend: this._zoomend,
			resize: this._setSize,
			viewreset: this._setSize
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	// _moveend: function (ev) {
			// console.log('_moveend res1_____:', ev);
		// const pos = L.DomUtil.getPosition(this._map.getPane('mapPane'));
// L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		// L.DomUtil.setTransform(this._canvas, {x: pos.x, y: pos.y}, 1);
		// this._copyCanvas(pos);
		// console.log('_moveend', ev);
		// this._rePaint();

	// },
	// _copyCanvas: function (pos) {
		// return;
	// },
	_setSize: function () {
        const map = this._map,
			mapSize = map.getSize(),
			min = map.containerPointToLayerPoint(mapSize).round(),
			size = new L.Bounds(min, min.add(mapSize).round()).getSize();
		this._canvas.width = size.x; this._canvas.height = size.y;
console.log('_setSize', size);
	},
	_animateZoom: function (e) {
        const map = this._map;
		this._scale = map.getZoomScale(e.zoom);
			
		L.DomUtil.setTransform(this._div,
		    map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min,
			this._scale
		);
	},

	_onresize: function (ev) {
		let map = this._map;
		const pos = L.DomUtil.getPosition(L.gmx.map.getPane('mapPane'));
		L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		let size = map.getSize();

		this._canvas.width = size.x; this._canvas.height = size.y;
		// this._canvas1.width = size.x; this._canvas1.height = size.y;
		// this._rePaint();
console.log('_onresize', map.getBounds(), size, this._map.getPixelOrigin(), this._map.getPixelBounds(), L.gmxUtil.getBboxes(this._map), ev);
	}
});