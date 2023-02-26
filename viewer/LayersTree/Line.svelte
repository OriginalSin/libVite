<script>
import Group from './Group.svelte'
import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';

export let layerID;
export let prp = {};
// export let type;
// export let props;

let gmxMap = L.gmx.gmxMap;
let item = gmxMap.layersByID[layerID] || {};
let _gmx = item._gmx || {};
let props = _gmx.properties || {};
let gmxStyles = props.gmxStyles || [];
let gmxStyle = gmxStyles.length === 1 ? gmxStyles[0] : null;
let iconImage =	'';
let iconStyle =	'';
if (gmxStyle) {
	if (gmxStyle.color) iconStyle += 'border: 1px ' + (gmxStyle.dashArray ? 'dashed ' : 'solid ') + gmxStyle.color + ';';
	if (gmxStyle.fillColor) iconStyle += 'background-color: ' + gmxStyle.fillColor + ';';
	if (gmxStyle.fillPattern) {
		let ic = L.gmxUtil.getPatternIcon(null, gmxStyle);
		iconStyle = 'rotate: 180deg; background-image: url(' + ic.canvas.toDataURL() + ');';
// console.log('item', layerID, ic);
	}
}
	

let meta = Object.keys(props.MetaProperties || {}).length ? true : false;
let name = props.title || prp.title || '';
let beforeIcon = props.IsRasterCatalog ? L.gmxUtil.setSVGIcon('timeline') : '';
let closed = prp.expanded ? '' : 'closed';
let visible = props.visible ? true : false;
let showCheckbox = prp.LayerID || prp.ShowCheckbox ? true : false;
let dragItem;

onMount(() => {
/*
*/
				// dragItem.style.cursor = 'move';
				// L.DomUtil.setPosition(dragItem);
	let draggable = new L.Draggable(dragItem).on({
		dragstart: function (ev) {
console.log('dragstart', ev);
			// dragItem.style.cursor = 'move';
			L.DomUtil.addClass(dragItem, 'gmx_drag');
			// L.DomUtil.addClass(node, 'gmx_drag');
		},
		drag: function (ev) {
console.log('drag', ev);
			// var target = ev.originalEvent.target,
				// tagName = target.tagName.toLowerCase();
			// if (tagName === 'li') {
				// toNode = target;
			// }
		},
		dragend: function (ev) {
console.log('dragend', ev);
			L.DomUtil.removeClass(dragItem, 'gmx_drag');
			L.DomUtil.setPosition(dragItem);
			// dragItem.style.cursor = 'move';
			// setTimeout(function() {
				// this._dragNode.draggable.disable();
				// L.DomUtil.removeClass(node, 'gmx_drag');
				// L.DomUtil.setPosition(node);
				// node.style.transform = '';
				// if (toNode) { 
					// toNode.parentNode.parentNode.insertBefore(node.parentNode, toNode.parentNode);
				// }
			// }.bind(this), 100);
		}
	}, this)
	L.DomEvent.on(dragItem, 'mouseover', ev => {
draggable.enable();
		// dragItem.style.position = 'absolute';
		// dragItem.style.cursor = 'move';
		// let target = ev.originalEvent.target;
		// L.DomUtil.addClass(dragItem, 'gmx_drag');
		// target.style.cursor = 'move';
// console.log('mouseover', ev);
	});
	L.DomEvent.on(dragItem, 'mouseout', ev => {
draggable.disable();
		// L.DomUtil.removeClass(dragItem, 'gmx_drag');
		// dragItem.style.cursor = '';
// console.log('mousedown', ev);
	});

				// draggable._onDown(ev);
	// console.log('onMount', type, props, childs);
});

const clickMe = ev => {
	const node = ev.target;
	// const nm = node.parentNode.parentNode.getAttribute('data-nm');
console.log('clickMe', layerID, node.classList);
};
const toggleLayer = ev => {
	// const node = ev.target;
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
		const bounds = L.gmxUtil.getGeometryBounds(_gmx.geometry).toLatLngBounds();
		gmxMap.leafletMap.fitBounds(bounds);
	}
}

</script>

<div layerid={layerID} class="line ui-droppable">
{#if beforeIcon}
	<span class="beforeIcon" on:click={clickMe}>{@html beforeIcon}</span>
{/if}
	{#if showCheckbox}<input type="checkbox" name="root" class="box" checked={visible} on:click={toggleLayer} />{/if}
{#if gmxStyle}
	<span class="colorIcon" title="Редактировать стили" style={iconStyle}>{@html iconImage}</span>
{/if}
	<span class="layer ui-draggable" bind:this={dragItem} on:click={showPos}>{name}</span>
	<span class="layerDescription"></span>
	{#if meta}<span class="layerInfoButton">i</span>{/if}
	<div multistyle="true" style="display: none;"></div>
</div>
<div swap="true" class="swap ui-droppable" style="font-size: 0px;"></div>


<style>
</style>
