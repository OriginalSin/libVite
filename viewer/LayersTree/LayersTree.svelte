<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Group from './Group.svelte'
	import DateRange from '../DateRange/DateRange.svelte'
	import { _layerTree } from '../stores.js';

	// export let map;

	let begin = new Date();
	let end = begin;
	let dateInterval = {begin, end};
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

</script>
<div class="map">
	<div class="mainmap-title">{props.title}</div>
	<div class="leftPanelCont scrollbar">
		<div class="layers-before">
			<DateRange {dateInterval} />
		</div>

		<div class="layers" bind:this={layersCont} >
			<Group {childs} {layersCont} on:refresh={refresh} />
		</div>
	</div>
</div>


<style>
</style>
