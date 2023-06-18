<script>
	import './app.css'
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Group from './Group.svelte'
	import DateRange from '../DateRange/DateRange.svelte'
	import { _layerTree } from '../stores.js';

	let gmxMap = L.gmx.gmxMap;
	let layersCont;
	let props = gmxMap.properties || {};
	let rawTree = gmxMap.rawTree;
	let childs = [];
	// let childs = rawTree.children;
	_layerTree.subscribe(value => {rawTree = value; childs = rawTree.children});
	
    onMount(() => {
		_layerTree.set(L.gmx.gmxMap.rawTree);
		// console.log('onMount', L.gmx.gmxMap.rawTree);
		// console.log('onMount childs', childs);
		
		// if (!rawTree) getGmxMap();
	});
	const refresh = ev => {
		const tree = ev.detail.tree;
		console.log('refresh', tree);
		// refresh
		_layerTree.set(tree);
		// childs = tree.children.slice();
	}
	const onRightClick = e => {
		gmxMap.leafletMap._showContextMenu({key: 'mapName', x: e.clientX, y: e.clientY });
	}

</script>
<div class="map">
	<div class="mainmap-title" on:contextmenu|preventDefault={onRightClick}>{props.title}</div>
	<div class="leftPanelCont scrollbar">
		<div class="layers-before">
			<DateRange />
		</div>

		<div class="layers" bind:this={layersCont} >
			<Group {childs} {layersCont} on:refresh={refresh} />
		</div>
	</div>
</div>


<style>
.mainmap-title {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    overflow-x: hidden;
    /* width: 320px; */
    text-overflow: ellipsis;
	padding: 7px 8px 7px 8px;

}

.layers-before,
.layers {
	border: 1px solid #DDD;
    /* padding: 10px 0px 10px 0px; */
    margin: 10px 5px;
}
/*
.leftPanelCont  div.layers > ul {
    margin-left: -8px;
}
*/
</style>
