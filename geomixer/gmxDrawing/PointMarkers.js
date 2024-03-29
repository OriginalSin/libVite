// import L from 'leaflet';
import Utils from './Utils.js';

const PointMarkers = L.Polygon.extend({
    options: {
        className: 'leaflet-drawing-points',
        noClip: true,
        smoothFactor: 0,
        opacity: 1,
        shape: 'circle',
        fill: true,
        fillColor: '#ffffff',
        fillOpacity: 1,
        size: L.Browser.mobile ? 40 : 8,
        weight: 2
    },
	_convertLatLngs: function (latlngs) {
		return L.Polyline.prototype._convertLatLngs.call(this, latlngs);
	},

    getRing: function () {
		return this._parent;
    },

    getFeature: function () {
		return this.getRing()._parent;
    },

    getPathLatLngs: function () {
        var out = [],
            size = this.options.size,
            dontsmooth = this._parent.options.type === 'Rectangle',
            points = this._parts[0],
            prev;

        for (var i = 0, len = points.length, p; i < len; i++) {
            p = points[i];
            if (i === 0 || dontsmooth || Math.abs(prev.x - p.x) > size || Math.abs(prev.y - p.y) > size) {
                out.push(this._latlngs[i]);
                prev = p;
            }
        }
        return out;
    },

    _getPathPartStr: function (points) {
        var round = L.Path.VML,
            size = this.options.size / 2,
            dontsmooth = this._parent && this._parent.options.type === 'Rectangle',
            skipLastPoint = this._parent && this._parent.mode === 'add' && !L.Browser.mobile ? 1 : 0,
            radius = (this.options.shape === 'circle' ? true : false),
            prev;

        for (var j = 0, len2 = points.length - skipLastPoint, str = '', strTitle = '', p; j < len2; j++) {
            p = points[j];
            if (round) { p._round(); }
            if (j === 0 || dontsmooth || Math.abs(prev.x - p.x) > this.options.size || Math.abs(prev.y - p.y) > this.options.size) {
                if (radius) {
                    str += 'M' + p.x + ',' + (p.y - size) +
                           ' A' + size + ',' + size + ',0,1,1,' +
                           (p.x - 0.1) + ',' + (p.y - size) + ' ';
                } else {
                    var px = p.x, px1 = px - size, px2 = px + size,
                        py = p.y, py1 = py - size, py2 = py + size;
                    str += 'M' + px1 + ' ' + py1 + 'L' + px2 + ' ' + py1 + 'L' + px2 + ' ' + py2 + 'L' + px1 + ' ' + py2 + 'L' + px1 + ' ' + py1;
                }
				strTitle += `<text x="${p.x}" y="${p.y}" class="small">Мой</text>`;
                prev = p;
            }
			
        }
		this.strTitle = strTitle;
        return str;
    },

    _onMouseClick: function (e) {
        //if (this._map.dragging && this._map.dragging.moved()) { return; }
        this._fireMouseEvent(e);
    },

	_updatePath: function () {
		if (Utils.isOldVersion) {
			if (!this._map) { return; }
			this._clipPoints();
			this.projectLatlngs();
			var pathStr = this.getPathString();

			if (pathStr !== this._pathStr) {
				this._pathStr = pathStr;
				if (this._path.getAttribute('fill-rule') !== 'inherit') {
					this._path.setAttribute('fill-rule', 'inherit');
				}
				this._path.setAttribute('d', this._pathStr || 'M0 0');
			}
		} else {
			var str = this._parts.length ? this._getPathPartStr(this._parts[0]) : '';
			this._renderer._setPath(this, str);
		}
		if (this._parent && this._parent.showTooltipPoints) {
			this._parent.showTooltipPoints(this._parts[0]);
		
		}
	}
});

export default PointMarkers;