<script>
import Group from './Group.svelte'
import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
import { _layerTree, _dateInterval, _contextMenu } from '../stores.js';

export let layerID;
export let prp = {};
	export let layersCont;
// export let type;
// export let props;
const dispatch = createEventDispatcher();

let nodeItem;

let gmxMap;
let item = {}, gmxStyle = {},
	iconStyle =	'',	iconImage =	'',	beforeIcon = '',
	name =	'', titleLayer = 'Границы слоя', titleTimeLine = '', closed = 'closed',
	showCheckbox = false, meta = false,	visible = false,
	_gmx = {};

const recalcItem = (id) => {
	gmxMap = L.gmx.gmxMap;
	item = gmxMap.layersByID[id] || {};
	_gmx = item._gmx || {};
	let props = _gmx.properties || {};
	let gmxStyles = props.gmxStyles || [];
	gmxStyle = gmxStyles.length === 1 ? gmxStyles[0] : null;
	iconImage =	''; iconStyle =	'';
	if (gmxStyle) {
		if (gmxStyle.color) iconStyle += 'border: 1px ' + (gmxStyle.dashArray ? 'dashed ' : 'solid ') + gmxStyle.color + ';';
		if (gmxStyle.fillColor) iconStyle += 'background-color: ' + gmxStyle.fillColor + ';';
		if (gmxStyle.fillPattern) {
			let ic = L.gmxUtil.getPatternIcon(null, gmxStyle);
			iconStyle = 'rotate: 180deg; background-image: url(' + ic.canvas.toDataURL() + ');';
	// console.log('item', layerID, ic);
		}
		if (gmxStyle.iconUrl) {
			let arr = gmxStyle.iconUrl.split('.'); 
			iconImage =	'<img class="icon ' + arr[arr.length - 1] + '" src="' + gmxStyle.iconUrl + '" />';
			iconStyle += 'margin-right: 4px;';
		}
	}
	meta = Object.keys(props.MetaProperties || {}).length ? true : false;
	name = props.title || prp.title || '';
	if (props.IsRasterCatalog) {
		titleLayer = 'Границы последнего снимка';
		beforeIcon = L.gmxUtil.setSVGIcon('timeline');
	}
	closed = prp.expanded ? '' : 'closed';
	visible = props.visible ? true : false;
	showCheckbox = prp.LayerID || prp.ShowCheckbox ? true : false;
};
$: layerID && recalcItem(layerID);

beforeUpdate(() => {
	// if (!rawTree) getGmxMap();
	// content = rawTree.content || {};
	// props = content.properties || {};
	// console.log('line', layerID, prp, item);
});

onMount(() => {
	let toNode;
	let li = nodeItem.parentNode;
	let draggable = new L.Draggable(li).on({
		dragstart: function (ev) {
// console.log('dragstart', ev);
			toNode = undefined;
			li.classList.add('gmx_drag');
			layersCont.classList.add('gmx_drag_cont');
		},
		drag: function (ev) {
			let node = ev.originalEvent.target;
			if (node.classList.contains('swapBegin') || node.classList.contains('swapEnd')) {
				toNode = node;
				return;
			}
			toNode = node.closest('li');
			if (toNode === li) {
				toNode = null;
			}
// console.log('drag', toNode);
		},
		dragend: function (ev) {
// console.log('dragend', ev, toNode);
			li.classList.remove('gmx_drag');
			layersCont.classList.remove('gmx_drag_cont');
			L.DomUtil.setPosition(li);
			if (toNode && toNode !== li) recalcTree(li, toNode);
		}
	}, this)
	L.DomEvent.on(nodeItem, 'mouseover', ev => {
		draggable.enable();
	});
	L.DomEvent.on(nodeItem, 'mouseout', ev => {
// draggable.disable();
		// L.DomUtil.removeClass(dragItem, 'gmx_drag');
		// dragItem.style.cursor = '';
// console.log('mousedown', ev);
	});
});

const getTreeLink = (node, flag) => {
	let grp = flag && node.classList.contains('group');
	let arr = [];
	while(node) {
		arr.push(node.getAttribute('data-nm'));
		node = node.tagName === 'LI' ? node.parentNode.closest('li') : null;
	}
	let link = {content: gmxMap.rawTree};
	let res = {};
	let out = {};
	arr = arr.reverse();
	arr.reduce((a, c, i) => {
		let ch = a.content.children;
		res = ch[c];
		if (i === arr.length - 1) {
			out = ch;
			if (grp) {
				out = res?.content.children || [];
				arr[i] = 0; }
		}
		return res;
	}, link);
	return {children: out, ind: arr.pop()};
};

const recalcTree = (f, t) => {
	const ff = getTreeLink(f);
	const it = ff.children.splice(ff.ind, 1)[0];
	const rawTree = gmxMap.rawTree;
	if (t.classList.contains('swapBegin')) {
		rawTree.children.unshift(it);
	} else if (t.classList.contains('swapEnd')) {
		rawTree.children.push(it);
	} else {
		const tt = getTreeLink(t, true);
		tt.children.splice(tt.ind, 0, it);
	}
	_layerTree.set(rawTree);
};

const clickMe = ev => {
	const node = ev.target;
	// const nm = node.parentNode.parentNode.getAttribute('data-nm');
console.log('clickMe', layerID, node.classList);
};
const toggleLayer = ev => {
	const node = ev.target;
	if (gmxMap.layersByID[layerID]) {
		const layer = gmxMap.layersByID[layerID];
// console.log('ggggg', layerID, gmxMap);
		if (layer._map) {
			gmxMap.leafletMap.removeLayer(layer);
		} else {
			gmxMap.leafletMap.addLayer(layer);
		}
	}
}
const showPos = ev => {
	if (_gmx.geometry) {
		let props = _gmx.properties;
		let bd = props.DateEndUTC * 1000;
		if (bd) {
			const layer = gmxMap.layersByID[layerID];
			
			let par = {
				layer: layerID,
				geometry: true,
				out_cs: 3857,
				pagesize: 1,
				orderby: props.identityField,
				orderdirection: 'DESC'
			};
			let body = Object.keys(par).map(function(key) { return encodeURIComponent(key) + '=' + encodeURIComponent(par[key]); }).join('&');

			fetch('//maps.kosmosnimki.ru/VectorLayer/Search.ashx', {
				method: 'post',
				mode: 'cors',
				credentials: 'include',
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
				body: body
			})
			.then(res => res.json())
			.then(res => {
				if (res.Status === 'ok') {
					let it = res.Result.values[0];
					let begin = it[res.Result.fields.findIndex(el => el === props.TemporalColumnName)];
					let geo = it[it.length - 1];
					bd = begin * 1000;
					let beg = new Date(bd), end = new Date(bd + 1000);
					layer.setDateInterval(beg, end);
_dateInterval.set({ begin: bd, end: bd + 1000});
					titleTimeLine = beg.toLocaleString() + ' по ' + end.toLocaleString();
					let bounds1 = L.gmxUtil.getGeometryBounds(geo).toLatLngBounds(true);
					gmxMap.leafletMap.fitBounds(bounds1);
console.log('showPos', beg, end);
				}
			})
			.catch(err => console.warn(err));

			// layer.setDateInterval(new Date(bd), new Date(bd + 1000));
		} else {
			const bounds = L.gmxUtil.getGeometryBounds(_gmx.geometry).toLatLngBounds();
			gmxMap.leafletMap.fitBounds(bounds);
		}
	}
}
const onRightClick = e => {
	gmxMap.leafletMap._showContextMenu({layerID, key: 'layerName', x: e.clientX, y: e.clientY });
	// _contextMenu.set({layerID, key: 'layerName'});
console.log('onRightClick', layerID);
}

</script>

<div bind:this={nodeItem} class="line" on:contextmenu|preventDefault={onRightClick}>
	<span class="beforeIcon" on:click={clickMe} title={titleTimeLine}>{@html beforeIcon}</span>
	{#if showCheckbox}<input type="checkbox" name="root" class="box" checked={visible} on:click={toggleLayer} />{/if}
	{#if gmxStyle}<span class="colorIcon" title="Редактировать стили" style={iconStyle}>{@html iconImage}</span>{/if}
	<span class="layer" on:click={showPos} title={titleLayer}>{name}</span>
	<span class="layerDescription"></span>
	{#if meta}<span class="layerInfoButton">i</span>{/if}
	<div multistyle="true" style="display: none;"></div>
	<div class="swap end"></div>
</div>

<style>
</style>
