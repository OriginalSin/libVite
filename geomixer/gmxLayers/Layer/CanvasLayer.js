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
	onRemove: function (map) {
		console.log('onRemove:', map);
	},

	onAdd: function (map) {
		if (!this._canvas) {
			// this._div = L.DomUtil.create('div', 'leaflet-image-layer leaflet-zoom-animated', map._gmxLayers);
			// this._div = L.DomUtil.create('div', 'leaflet-image-layer', map._gmxLayers);
			this._div = L.DomUtil.create('div', 'leaflet-image-layer gmxLayers', this.getPane());
			this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay canv', this._div);
			// this._canvas1 = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div);
			// this._canvas1 = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div);
			// this._canvas1 = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div.parentNode);
		// this._canvas1.style.display = 'none';
			// this._canvas.style.zIndex = 1;
			this._setSize();
			/*
			this._canvasBox = this._canvas.getBoundingClientRect();
			L.DomEvent.on(this._canvas, 'mousemove', this._mousemove, this);
			*/
			// const offscreen = this._canvas.transferControlToOffscreen();
			// this.options.dataManager.postMessage({
				// cmd: 'addLayer',
				// id: this.options.layerId,
				// canvas: offscreen,
				// dateBegin: this.options.dateBegin,
				// dateEnd: this.options.dateEnd,
			// }, [offscreen]);
		}

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
		const pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds);
		L.gmx.vw._sendCmd({id: this.options.id, tileRange, cmd: 'drawScreen'} ).then(res1 => {
			// console.log('_rePaint res1_____:', res1);
			this._canvas.getContext('bitmaprenderer').transferFromImageBitmap(res1.bitmap);
			const pos = L.DomUtil.getPosition(this._map.getPane('mapPane'));
			L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);

			this._canvas.style.display = 'block';
		// this._canvas1.style.display = 'none';

		});
		// this.options.dataManager.postMessage({
			// cmd: 'drawScreen',
			// width: this._canvas.width,
			// height: this._canvas.height,
		// });
	},

	_pxBoundsToTileRange(bounds) {
		const tileSize = {x: 256, y: 256};
		return new L.Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	},

	_getTiledPixelBounds() {
		const map = this._map,
		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
		    // mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
		    _tileZoom = mapZoom,
		    scale = map.getZoomScale(mapZoom, _tileZoom),
		    pixelCenter = map.project(map.getCenter(), _tileZoom).floor(),
		    halfSize = map.getSize().divideBy(scale * 2);

		return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	},

	getEvents: function () {
		let events = {
			// movestart: this._movestart,
			moveend: this._moveend,
			// zoomend: this._zoomend,
			resize: this._onresize,
			viewreset: this._onresize
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},
/*

	_mousemove: function (ev) {
		  // tell the browser we're handling this event
		ev.preventDefault();
		ev.stopPropagation();

		mouseX = parseInt(ev.clientX - this._canvasBox.left);
		mouseY = parseInt(ev.clientY - this._canvasBox.top);

		console.log('_mousemove:', mouseX, mouseY, ev);
		// Put your mousemove stuff here
		// var newCursor;
		// for(var i=0;i<shapes.length;i++){
		// var s=shapes[i];
		// definePath(s.points);
		// if(ctx.isPointInPath(mouseX,mouseY)){
		  // newCursor=s.cursor;
		  // break;
		// }
		// }
	},

	_zoomend: function (ev) {
		// this._copyCanvas();
		// this._canvas.style.display = 'block';
		// this._canvas1.style.display = 'none';
		this._trans = this._div.style.transform;
	// this._canvas1.style.transform = this._trans;
		
		console.log('_zoomend', this._zoomAnimated, ev);
		// this._zoomAnimated = false;
// setTimeout(() => {
	// this._div.style.transform = this._trans; }
// , 150);

	},
*/

	_moveend: function (ev) {
		// const pos = L.DomUtil.getPosition(this._map.getPane('mapPane'));
// L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		// L.DomUtil.setTransform(this._canvas, {x: pos.x, y: pos.y}, 1);
		// this._copyCanvas(pos);
		// console.log('_moveend', ev);
		this._rePaint();

	},
	_copyCanvas: function (pos) {
		return;
		let canvas = this._canvas1;
/*
		let sx = pos.x > 0 ? pos.x : -pos.x, sy = pos.y > 0 ? pos.y : -pos.y, sw = this._canvas.width - sx, sh = this._canvas.height - sy;
		let dx = pos.x > 0 ? pos.x : 0, dy = pos.y > 0 ? pos.y : 0, dw = this._canvas.width - dx, dh = this._canvas.height - dy;
		if (pos.x > 0) {
			dw = sw;
			sx = 0;
		} else {
		}
		if (pos.y > 0) {
			dh = sh;
			sy = 0;
		} else {
		}
		// setTimeout(() => {
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// ctx.drawImage(this._canvas, 0, 0);
			ctx.drawImage(this._canvas, sx, sy, sw, sh, dx, dy, dw, dh);
			*/
		// canvas.getContext('bitmaprenderer').transferFromImageBitmap(this._canvas);
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(this._canvas, 0, 0);
		L.DomUtil.setTransform(canvas, {x: pos.x, y: pos.y}, 1);
		canvas.style.display = 'block';
		this._canvas.style.display = 'none';
		// }, 250);
	},
/*
	_movestart: function (ev) {
		const pos = L.DomUtil.getPosition(this._map.getPane('mapPane'));
		// L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		// L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		// L.DomUtil.setTransform(this._canvas, {x: pos.x, y: pos.y}, 1);
		this._copyCanvas(pos);
		// this._copyCanvas();
		// this._canvas.style.display = 'none';
		// this._canvas1.style.display = 'block';
		console.log('_movestart', ev);
	},
*/
	_setSize: function () {
		let mapSize = this._map.getSize();
		let min = this._map.containerPointToLayerPoint(mapSize).round();
		let size = new L.Bounds(min, min.add(mapSize).round()).getSize();
		this._canvas.width = size.x; this._canvas.height = size.y;
		// this._canvas1.width = size.x;
		// this._canvas1.height = size.y;
console.log('_setSize', size);
	},
	// rendered: function (bitmap) {
		// L.DomUtil.setPosition(this._div, this._map._getMapPanePos().multiplyBy(-1));
		// if (bitmap) {
			// let ctx = this._canvas.getContext('2d');
			// ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			// ctx.drawImage(bitmap, 0, 0, this._canvas.width, this._canvas.height);
		// } else {
// setTimeout(() => {
			// this._canvas.style.display = 'block';
			// this._canvas1.style.display = 'none';
// }, 1750);
		// }
		// console.log('rendered', this._zoomAnimated, bitmap);
	// },
	_animateZoom: function (e) {
		// return;
        let map = this._map;
		this._scale = map.getZoomScale(e.zoom);
			// this._canvas.style.display = 'block';
			
		L.DomUtil.setTransform(this._div,
		    map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min,
			this._scale
		);
		// L.DomUtil.setTransform(this._canvas1, {x: 0, y: 0},	this._scale);
			// this._canvas1.style.display = 'block';
		// console.log('_animateZoom', this._zoomAnimated, e);
	},

	_onresize: function (ev) {
		let map = this._map;
		const pos = L.DomUtil.getPosition(L.gmx.map.getPane('mapPane'));
		L.DomUtil.setTransform(this._div, {x: -pos.x, y: -pos.y}, 1);
		let size = map.getSize();
// console.log('_onresize', map.getBounds(), size, this._map.getPixelOrigin(), this._map.getPixelBounds(), L.gmxUtil.getBboxes(this._map), ev);

		this._canvas.width = size.x; this._canvas.height = size.y;
		// this._canvas1.width = size.x; this._canvas1.height = size.y;
		// this._rePaint();
	}
});