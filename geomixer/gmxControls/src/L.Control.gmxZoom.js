L.Control.GmxZoom = L.Control.Zoom.extend({
    options: {
        id: 'zoom',
        disableEvents: 'mousemove mousedown contextmenu',
		//position: 'gmxbottomright',	// topleft left topright right gmxbottomright
		info: true
    },

    onAdd: function (map) {
		this.options.zoomInfoTitle = 'Current zoom';
        if (L.gmxLocale && L.gmxLocale.getLanguage() === 'rus') {
			this.options.zoomInTitle = 'Увеличить';
			this.options.zoomOutTitle = 'Уменьшить';
			this.options.zoomInfoTitle = 'Текущий номер зума';
        }
		var classPrefix = 'gmxzoom',
			needInfo = !this._zoomInfo;
		if (this.options.info && needInfo) {
			this._zoomInfo = L.DomUtil.create('input', classPrefix + '-info');
			this._zoomInfo.title = this.options.zoomInfoTitle;
			L.DomEvent.on(this._zoomInfo, 'change', ev => {
				map.setZoom(this._zoomInfo.value);
			}, this);
		}
		var container = L.Control.Zoom.prototype.onAdd.call(this, map);
		L.DomUtil.addClass(container, classPrefix + '-container');
		if (this.options.info && needInfo) container.insertBefore(this._zoomInfo, this._zoomOutButton);
		L.DomEvent.disableClickPropagation(container);
        return container;
    },

    _updateDisabled: function (ev) {
        L.Control.Zoom.prototype._updateDisabled.call(this, ev);
		if (this._zoomInfo) {
			var map = this._map,
				z = map._zoom;
			if (z <= map.getMinZoom() || z >= map.getMaxZoom()) {
				L.DomUtil.addClass(this._zoomInfo, 'gmxZoomRed');
			} else {
				L.DomUtil.removeClass(this._zoomInfo, 'gmxZoomRed');
			}
			this._zoomInfo.value = z;
		}
    },

    setVisible: function(isVisible) {
        if (this._container) {
            this._container.style.display = isVisible ? 'block' : 'none';
        }
    }
});

L.Control.gmxZoom = L.Control.GmxZoom;
L.control.gmxZoom = function (options) {
  return new L.Control.GmxZoom(options);
};
