
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

	_updatePolyMerc: function (ph) {
	// _updatePoly: function (layer, closed) {
// console.log('_updatePolyMerc _____1__________:', ph);
		ph = _reqParse(ph);
		if (!ph._drawing) { return; }

		let i, j, len2, p,
			// coords = ph.coords,
			parts = ph.itemData.pixels || ph._parts,
			mInPixel = ph.mInPixel,
			item = ph.itemData.item,
			geo = item[item.length - 1],
			type = geo.type,
			coordinates = geo.coordinates,
			hiddenLines = ph.itemData.hiddenLines,
			len = coordinates.length,
			ctx = ph._ctx;

	 	if (type.substr(0, 5) !== 'MULTI') {
			coordinates = [coordinates];
			hiddenLines = [hiddenLines];
		}
		if (!len) { return; }
		// let path = new Path2D();
		coordinates.forEach((it, i) => {
			it.forEach((it1, i1) => {
				// ctx.beginPath();
				let rarr = [];
				let hit1 = hiddenLines[i][i1].slice(0);
				let hn = hit1.shift();
				it1.forEach((p, j) => {
					let m = j === 0;
					if (j === hn) { m = true; hn = hit1.shift(); }
					let x = Math.round(p[0] * mInPixel - ph.tpx);
					let y = Math.round(ph.tpy - p[1] * mInPixel);
					rarr = rarr.concat([m ? 'M' : 'L', x, y]);
				});
				let rstr = rarr.join(' ');
		utils._fillStroke(ph, false, true);
				// ctx.globalAlpha = 0.2;
				ctx.fill(new Path2D(rstr.replace(/ M/g, ' L')), 'evenodd');
				// ctx.globalAlpha = 1;
		utils._fillStroke(ph, true);
				ctx.stroke(new Path2D(rstr));

				// rarr.push('Z');
// let p = new Path2D(rstr);
// path.addPath(p);
// console.log('fff ', path, rstr);
				// ctx.closePath();
			});
		});

// path1.rect(10, 10, 100, 100);

// let path2 = new Path2D(path);
// path2.moveTo(220, 60);
// path2.arc(170, 60, 50, 0, 2 * Math.PI);

/*
ctx.globalAlpha = 0.2;
ctx.fill(path, 'evenodd');
ctx.globalAlpha = 1;
ctx.stroke(path);
  ctx.save();
  
  // let 	sx = 5,
		// sy = 5;
// ctx.lineWidth = 1 / 5;

		// ctx.scale(sx, sy);
  // ctx.strokeRect(1 , 20 , 10 * sx , 10 * sy);
  // ctx.restore();
  // ctx.strokeRect(1 , 70 , 10 , 10);
		// ctx.translate(ph.tpx / mInPixel, ph.tpy / mInPixel);
		// ctx.translate(ph.tpx, -ph.tpy);
		// ctx.translate(ph.tpx, 0);
		// ctx.translate(22, 0);
		ctx.scale(mInPixel, mInPixel);
		ctx.translate(ph.tpx * mInPixel, -ph.tpy * mInPixel);
		// ctx.translate(ph.tpx, ph.tpy);
		ctx.lineWidth = ctx.lineWidth / mInPixel;
  // ctx.fillRect(1 / mInPixel, 10 / mInPixel, 10 / mInPixel, 10 / mInPixel);
  // ctx.strokeRect(1 / mInPixel, 10 / mInPixel, 10 / mInPixel, 10 / mInPixel);
  // ctx.strokeRect(1 * mInPixel, 10 * mInPixel, 10 * mInPixel, 10 * mInPixel);
  // ctx.fillRect(2 / mInPixel, 20 / mInPixel, 20 / mInPixel, 20 / mInPixel);
  // ctx.restore();

		coordinates.forEach((it, i) => {
			it.forEach((it1, i1) => {
				ctx.beginPath();
				let hit1 = hiddenLines[i][i1].slice(0);
				let hn = hit1.shift();
				it1.forEach((p, j) => {
					let m = j === 0;
					if (j === hn) {
						m = true;
						hn = hit1.shift();
					}
console.log('fff ', m, j, p);
					ctx[m ? 'moveTo' : 'lineTo'](p[0], p[1]);
				});
				ctx.closePath();
			});
		});

		for (i = 0; i < len; i++) {
			for (j = 0, len2 = coordinates[i].length; j < len2; j++) {
				p = coordinates[i][j];
				ctx[j ? 'lineTo' : 'moveTo'](p[0], p[1]);
			}
			// for (j = 0, len2 = parts[i].length; j < len2; j++) {
				// p = parts[i][j];
				// ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
			// }
			if (ph.closed) {
				ctx.closePath();
			}
		}
*/
  // ctx.restore();
// ctx.strokeText(coords.z + '.' + coords.x + '.' + coords.y, 150, 150);


		// utils._fillStroke(ph, true, true);
/*
*/
  // ctx.restore();

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
	},

	_fillStroke: function (ph, stroke, fill) {
	// _fillStroke: function (ctx, layer) {
		ph = _reqParse(ph);
		let options = ph.options,
			ctx = ph._ctx;

		if (fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fillStyle = options.fillColor || options.color;
			// ctx.fill(options.fillRule || 'evenodd');
		}

		if (stroke && options.weight !== 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(options && options._dashArray || []);
			}
			ctx.globalAlpha = options.opacity !== undefined ? options.opacity : 1;
			ctx.lineWidth = options.weight;
			ctx.strokeStyle = options.color;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.lineJoin;
			// ctx.stroke();
		}
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