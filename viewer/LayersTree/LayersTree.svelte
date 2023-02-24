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
	<div class="leftPanelHeader"></div>
	<div class="layers-before">
		<DateRange {dateInterval} />
	</div>

	<div class="layers">
		<Group {gmxMap} {type} {props} {childs} />
	</div>
</div>


<style>

.layers-before,
.layers {
	border: 1px solid #DDD;
    /* padding: 10px 0px 10px 0px; */
    margin: 10px 5px;
}
.mainmap-title {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    overflow-x: hidden;
    /* width: 320px; */
    text-overflow: ellipsis;
	padding: 7px 8px 7px 8px;

}
</style>
