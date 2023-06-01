<script>
import Draggable from '../Modal/Draggable.svelte';
// import Table from './Table.svelte'
export let left = 100;
export let top = 100;
export let nw = 100;
export let onSelect;

let map = L.gmx.gmxMap.leafletMap;
let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	map._drawingList.$destroy();
};
const selItem = (it) => {
	
	// map._destroyTableAttrs(layerID);
	// $$self.$destroy();
console.log('selItem', it);
};
console.log('features', features);

</script>

<Draggable >

<div class="DrawingList">
	<div class="header">
		<span class="title">Выбор контура</span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>

	<div class="body">
		{#if features && features.length}
			{#each features as it}
			{@const name = it.options.type}
			{@const geoJSON = it.toGeoJSON().geometry}

			<div>
				<span class="Polygon"></span>
				<button on:click={() => onSelect(it)} class="name">{name}</button>
				<span class="summary">({L.gmxUtil.getGeoJSONSummary(geoJSON)})</span>
			</div>
			{/each}
		{:else}
			<div>
				<span class="Polygon">Нет подходящих обьектов на карте</span>
			</div>
		{/if}
	</div>
</div>

</Draggable>


<style>
.DrawingList {
    background-color: #FFFFFF;

	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;

}
.DrawingList .title {
	pointer-events: none;
	padding-left: 16px;
}

.DrawingList .header {
    font-weight: bold;
}

.DrawingList .header button.close {

    right: 4px;
    /* top: 26px; */
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}

.DrawingList .body {
    padding-right: 6px;
}
.DrawingList .body button {
	padding-left: 4px;

}

</style>
