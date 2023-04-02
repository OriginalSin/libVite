import {gmxAPIutils} from '../Utils.js';

/*
 (c) 2014, 2023 Sergey Alekseev
 Leaflet.LabelsLayer, plugin for Gemixer layers.
*/
L.LabelsLayer = L.Layer.extend({
    options: {
		animate: false,
		labels: 'default',
        pane: 'overlayPane'
    },

    initialize: function (map, options) {
        L.setOptions(this, L.extend(this.options, options));
        this.__map = map;
        this._observers = {};
        this._styleManagers = {};
        this._labels = {};
        this._labelsIndex = {};
        var _this = this;

        this.bbox = gmxAPIutils.bounds();
    },

    redraw: function () {
        if (!this._frame && this.__map && !this.__map._animating) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },

    _addToPane: function () {
        var pane = this.__map.getPanes()[this.options.pane];
        if (pane) {
            pane.insertBefore(this._canvas, pane.firstChild);
        }
    },

    onAdd: function (map) {
        // this._map = map;

        if (!this._canvas) {
            this._initCanvas();
        }
		// var arr = window.location.search.match('labels=([^&]+)');
		// if (arr) {
			// this.options.labels = arr[1];
		// }

        this._addToPane();
        map.on({
            moveend: this._reset,
            zoomstart: this._hideMe,
            // layeradd: this._layeradd,
            // layerremove: this._layerremove
        }, this);

        this._reset();
    },

    _hideMe: function () {
		this._canvas.style.visibility = 'hidden';
    },

    onRemove: function (map) {
        if (this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }

        map.off({
            moveend: this._reset,
            zoomstart: this._hideMe,
            // layeradd: this._layeradd,
            // layerremove: this._layerremove
        }, this);
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _initCanvas: function () {
        var canvas = L.DomUtil.create('canvas', 'leaflet-labels-layer leaflet-layer leaflet-zoom-hide'),
            size = this.__map.getSize();
        canvas.width  = size.x; canvas.height = size.y;
        canvas.style.pointerEvents = 'none';
        this._canvas = canvas;
    },

    _updateBbox: function () {
        var _map = this.__map,
            screenBounds = _map.getBounds(),
            southWest = screenBounds.getSouthWest(),
            northEast = screenBounds.getNorthEast(),
			crs = _map.options.srs == 3857 ? L.CRS.EPSG3857 : L.Projection.Mercator,
            m1 = crs.project(southWest),	// предполагаем что все слои в одной проекции
            m2 = crs.project(northEast),
			_zoom = _map.getZoom();

        this.mInPixel = gmxAPIutils.getPixelScale(_zoom);
        this._ctxShift = [m1.x * this.mInPixel, m2.y * this.mInPixel];
        // for (var id in this._observers) {
			// var observer = this._observers[id];
			// if (observer.targetZoom) {
				// observer.targetZoom = _zoom;
			// }
            // observer.setBounds({
                // min: {x: southWest.lng, y: southWest.lat},
                // max: {x: northEast.lng, y: northEast.lat}
            // });
        // }
    },

    _reset: function () {
        this._updateBbox();
        // for (var id in this._observers) {
            // var observer = this._observers[id];
            // if (!observer.isActive() &&
                // this._styleManagers[id].isVisibleAtZoom(this.__map.getZoom())
            // ) {
                // observer.activate();
            // }
            // observer.fire('update');
        // }
		setTimeout(function() {
			this._canvas.style.visibility = '';
		}.bind(this), 200);
    },

    _redraw: function () {
        var out = [],
            _map = this.__map;

		if (!_map || !_map._mapPane) { return; }

        var mapSize = _map.getSize(),
            _canvas = this._canvas,
            chkIntersects = this.options.labels,
            offset = _map.latLngToContainerPoint(_map.getBounds().getNorthWest()),
            topLeft = _map.containerPointToLayerPoint(offset);

		_canvas.width = mapSize.x; _canvas.height = mapSize.y;
        L.DomUtil.setPosition(_canvas, topLeft);

        this._frame = null;
    },
    _animateZoom: function (e) {
		var scale = this.__map.getZoomScale(e.zoom),
		    offset = this.__map._latLngBoundsToNewLayerBounds(this.__map.getBounds(), e.zoom, e.center).min;
		L.DomUtil.setTransform(this._canvas, offset, scale);
    }
});

L.labelsLayer = function (map, options) {
    return new L.LabelsLayer(map, options);
};

L.Map.addInitHook(function () {
	// Check to see if Labels has already been initialized.
    // if (!this._labelsLayer) {
        // this._labelsLayer = new L.LabelsLayer(this, this.options);
        // this._labelsLayer.addTo(this);
    // }
});
