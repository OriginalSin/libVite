<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Group from './Group.svelte'
	import DateRange from '../DateRange/DateRange.svelte'

	// export let map;

	let begin = new Date();
	let end = begin;
	let dateInterval = {begin, end};
	let gmxMap = L.gmx.gmxMap;
	let type = 'map';
	let props = gmxMap.properties || {};
	let childs = gmxMap.rawTree.children;
    onMount(() => {
		// if (!rawTree) getGmxMap();
	});

</script>
<div class="map">
	<div class="mainmap-title">{props.title}</div>
	<div class="leftPanelCont scrollbar">
		<div class="layers-before">
			<DateRange {dateInterval} />
		</div>

		<div class="layers">
			<Group {childs} />
		</div>
	</div>
</div>


<style>
</style>
