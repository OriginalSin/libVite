
// const HOST = 'maps.kosmosnimki.ru';

// let hosts = {},
	// zoom = 3,
	// bbox = null,
	// dataManagersLinks = {},
	// hostBusy = {},
	// needReq = {}
	// delay = 60000,
	// intervalID = null,
	// timeoutID = null;

// ph = {
	// ctx: - 2d canvas контекст
	// bounds: - bounds операции
	// w: - canvas.width
	// h: - canvas.height
	// canvas: - canvas
// }
const _reqParse = (ph) => {
	ph = ph || {};
	if (ph.canvas) {
		ph._ctx = ph._ctx || ph.canvas.getContext('2d');
		ph.w = ph.w || ph.canvas.width;
		ph.h = ph.h || ph.canvas.height;
	}
	return ph;
};

const utils = {
	_updatePolyMerc: function (ph) {
		ph = _reqParse(ph);
		if (!ph._drawing) { return; }

		let mInPixel = ph.mInPixel,
			itemData = ph.itemData,
			item = itemData.item,
			geo = item[item.length - 1],
			type = geo.type,
			coordinates = geo.coordinates,
			hiddenLines = itemData.hiddenLines,
			paths = itemData.paths,
			ctx = ph._ctx;

		if (!coordinates.length) return;
	 	if (type.substr(0, 5) !== 'MULTI') {
			coordinates = [coordinates];
			hiddenLines = [hiddenLines];
		}
		const matrix = new DOMMatrix([
		  mInPixel, 0, 0, mInPixel,
		  -ph.tpx, ph.tpy
		]);
		let fPath = new Path2D(), sPath = new Path2D();
		paths.forEach(it => it.forEach(it2 => {
			if (it2[0]) {
				fPath.addPath(it2[1], matrix);
				sPath.addPath(it2[2], matrix);
			}
		}));
/*
		paths.forEach(it => {
			it.forEach(it2 => {
					if (it2[0]) {
						fPath.addPath(it2[1], matrix);
						sPath.addPath(it2[2], matrix);
					}
			});
		});
		coordinates.forEach((it, i) => {
			it.forEach((it1, i1) => {
					let rarr = [];
				let hit1 = hiddenLines[i][i1].slice(0);
				let hn = hit1.shift();
				let pathf = new Path2D();
				let paths = new Path2D();
				it1.forEach((p, j) => {
					let m = j === 0;
					if (j === hn) { m = true; hn = hit1.shift(); }
					let x = p[0], y = -p[1];
					paths[m ? 'moveTo' : 'lineTo'](x, y);
					pathf[j ? 'lineTo' : 'moveTo'](x, y);
					// if (m) paths.moveTo(x, y);
					// else paths.lineTo(x, y);
						// let x = Math.round(p[0] * mInPixel - ph.tpx);
						// let y = Math.round(ph.tpy - p[1] * mInPixel);
						// rarr = rarr.concat([m ? 'M' : 'L', x, y]);
				});
				// paths.closePath();
				pathf.closePath();
				sPath.addPath(paths, matrix);
				fPath.addPath(pathf, matrix);
			});
		});
*/
		utils._fillStroke(ph, false, true);
		ctx.fill(fPath);
		utils._fillStroke(ph, true);
		ctx.stroke(sPath);
		ctx.globalAlpha = 0;
	},

	_fillStroke: function (ph, stroke, fill) {
		ph = _reqParse(ph);
		let options = ph.options,
			ctx = ph._ctx;
                // out.canvasPattern = (pt.canvasPattern ? pt.canvasPattern : gmxAPIutils.getPatternIcon(item, pt, indexes));

// console.log('_fillStroke', options);
		// if (fill && options.fillColor) {
			// ctx.globalAlpha = options.fillOpacity !== undefined ? options.fillOpacity : 1;
			// ctx.fillStyle = options.fillColor;
		if (fill) {
			// if (options.fillColor) ctx.fillStyle = options.fillColor;
			
			// ctx.fill(options.fillRule || 'evenodd');
			if (options.imageBitmap) {
				ctx.fillStyle = ctx.createPattern(options.imageBitmap, 'repeat');
			} else if (options.fillColor) {
				ctx.fillStyle = options.fillColor;
			}
			ctx.globalAlpha = options.fillOpacity !== undefined ? options.fillOpacity : 1;
		}

		if (stroke && options.weight !== 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(options && options.dashArray || []);
			}
			ctx.globalAlpha = options.opacity !== undefined ? options.opacity : 1;
			ctx.lineWidth = options.weight;
			ctx.strokeStyle = options.color;
			ctx.lineCap = options.lineCap || 'round';
			ctx.lineJoin = options.lineJoin || 'round';
			// ctx.stroke();
		}
	},

	_clear: function (ph) {
		ph = _reqParse(ph);
		if (ph.bounds) {
			let size = ph.bounds.getSize();
			ph._ctx.clearRect(ph.bounds.min.x, ph.bounds.min.y, size.x, size.y);
		} else {
			ph._ctx.save();
			ph._ctx.setTransform(1, 0, 0, 1, 0, 0);
			ph._ctx.clearRect(0, 0, ph.w, ph.h);
			ph._ctx.restore();
		}
	},

	_draw: function (ph) {
		ph = _reqParse(ph);
		// var layer, bounds = this._redrawBounds;
		ph._ctx.save();
		if (ph.bounds) {
			let size = ph.bounds.getSize();
			ph._ctx.beginPath();
			ph._ctx.rect(ph.bounds.min.x, ph.bounds.min.y, size.x, size.y);
			ph._ctx.clip();
		}

		ph._drawing = true;

		for (let order = ph._drawFirst; order; order = order.next) {
			let layer = order.layer;
			if (!ph.bounds || (layer._pxBounds && layer._pxBounds.intersects(ph.bounds))) {
				// layer._updatePath();
			}
		}

		ph._drawing = false;

		ph._ctx.restore();  // Restore state before clipping.
	},

	_updatePoly: function (ph) {
	// _updatePoly: function (layer, closed) {
		ph = _reqParse(ph);
		if (!ph._drawing) { return; }

		let i, j, len2, p,
			// coords = ph.coords,
			parts = ph.itemData.pixels || ph._parts,
			len = parts.length,
			ctx = ph._ctx;

		if (!len) { return; }

		ctx.beginPath();

		for (i = 0; i < len; i++) {
			for (j = 0, len2 = parts[i].length; j < len2; j+=2) {
				//p = parts[i][j];
				ctx[j ? 'lineTo' : 'moveTo'](parts[i][j], parts[i][j + 1]);
			}
			// for (j = 0, len2 = parts[i].length; j < len2; j++) {
				// p = parts[i][j];
				// ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
			// }
			if (ph.closed) {
				ctx.closePath();
			}
		}
// ctx.strokeText(coords.z + '.' + coords.x + '.' + coords.y, 150, 150);


		utils._fillStroke(ph);

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},


	_updateCircle: function (ph) {
	// _updateCircle: function (layer) {
		ph = _reqParse(ph);

		if (!ph._drawing || !ph._point) { return; }

		let p = ph._point,
			ctx = ph._ctx,
			r = Math.max(Math.round(ph._radius), 1),
			s = (Math.max(Math.round(ph._radiusY), 1) || r) / r;

		if (s !== 1) {
			ctx.save();
			ctx.scale(1, s);
		}

		ctx.beginPath();
		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

		if (s !== 1) {
			ctx.restore();
		}

		utils._fillStroke(ph);
	}
}

export default {
	draw: utils._draw,
	updatePolyMerc: utils._updatePolyMerc,
	updatePoly: utils._updatePoly,
	updateCircle: utils._updateCircle,
	fillStroke: utils._fillStroke,
	clear: utils._clear
};