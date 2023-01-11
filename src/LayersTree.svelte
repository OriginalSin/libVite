<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	// import MyIcon from '../svg/s-tree.svg';
  // import svelteLogo from './assets/svelte.svg'
	import Line from './Line.svelte'
  
	export let map;

	const mapId = 'FEZ2G';
	let rawTree;
	let gmxMap = {};
	let type = 'map';
	let props = {};
	let childs = [];
	const getGmxMap = () => {
		L.gmx.loadMap(mapId, {
			leafletMap: map,
			hostName: '/',
			setZIndex: true,
			disableCache: true,
			// gmxEndPoints: gmxEndPoints
		}).then(res => {
			gmxMap = res;
			gmxMap.leafletMap = map;
			childs = gmxMap.rawTree.children;
			rawTree = { content: gmxMap.rawTree };
			props = gmxMap.properties || {};
			const mbounds = L.latLngBounds([props.MinViewY || 57, props.MinViewX || 22], [props.MaxViewY || 68, props.MaxViewX || 58]);
			map.setMaxBounds(mbounds);
			map.setMinZoom(props.MinZoom || 6);
			map.invalidateSize();
			map.options.distanceUnit = props.DistanceUnit;
			map.options.squareUnit = props.SquareUnit;
			// map.options._gmxEndPoints = gmxEndPoints;
	console.log('gmxMap', gmxMap);
		});
	}
    onMount(() => {
		if (!rawTree) getGmxMap();
	});

</script>
	<div class="map">
		<span class="groupLayer ui-draggable" dragg="true">{props.title}</span>
		<div class="layers">
			<Line {gmxMap} {type} {props} {childs} />
		</div>
	</div>


<style>

	
</style>
