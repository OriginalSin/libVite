<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Group from './Group.svelte'
	// import Line from './Line.svelte'

	// export let map;

	let rawTree;
	let gmxMap = L.gmxMap;
	let type = 'map';
	let props = gmxMap.properties || {};
	let childs = gmxMap.rawTree.children;
    onMount(() => {
		// if (!rawTree) getGmxMap();
	});

</script>
	<div class="map">
		<span class="groupLayer ui-draggable" dragg="true">{props.title}</span>
		<div class="layers">
			<Group {gmxMap} {type} {props} {childs} />
		</div>
	</div>


<style>

	
</style>
