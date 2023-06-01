<script>
import Draggable from '../Modal/Draggable.svelte';
import CreateDescr from './CreateDescr.svelte';

export let data;

let layerID = data.layerID;
let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;
let props = layersByID[layerID]._gmx.properties;
let attributes = props.attributes;

let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	map._destroyEditObject(layerID);
};
const setGeo = (pt) => {
// console.log('setGeo', pt);
	if (map._drawingList) map._drawingList.$destroy();
	map._drawingList = new DrawingList({
		target: document.body,
		props: {
			onSelect: (it) => {
				geoJSON = it.toGeoJSON().geometry;
				map._drawingList.$destroy();
console.log('onSelect', geoJSON);
			},
			left: 200,
			top: 200
		}
	});

};
let showModal = false;
const ok = (ev) => {
	showModal = false;
console.log('ok', ev);
};
const editDescr = (ev) => {
	showModal = true;
	
	if (map._createDescr) map._createDescr.$destroy();
	map._createDescr = new CreateDescr({
		target: document.body,
		props: {
			showModal,
			onSelect: (it) => {
			},
			left: 200,
			top: 200
		}
	});
console.log('editDescr', ev);
};
const save = (ev) => {
console.log('save', ev);
};

console.log('attributes', layerID, data);

</script>

<Draggable>

<div class="EditObject">
	<div class="header">
		<span class="title">Создать объект слоя: </span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body scrollbar">
		<table><tbody>
		<tr class="rawGeo">
			<td class="name" colspan=2>
				<span class="edit-obj-geomtitle">Геометрия</span><button on:click={setGeo} class="geom" />
			</td>
		</tr>
		{#each (attributes || []) as name}
		<tr>
			<td class="name">
				<span>{name}</span>
			</td>
			<td class="val">
				<input type="text" />
			</td>
		</tr>
		{/each}
		<tr class="Descr">
			<td class="name">
				<span>Описание</span>
			</td>
			<td class="val">
				<button on:click={editDescr}>Редактировать</button>
			</td>
		</tr>
		</tbody></table>
	</div>
	<div class="foot">
		<button on:click={save} class="save">Создать</button>
	</div>
</div>

</Draggable>

<style>
.EditObject {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.EditObject .header {
    font-weight: bold;
}
.EditObject .title {
	pointer-events: none;
}
.EditObject .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}
.EditObject .body {
    height: 400px;
    overflow-y: auto;
}
.EditObject button.geom {
    background-image: url(/img/choose2.png);
    background-repeat: no-repeat;
    display: inline-block;
}

.EditObject table {
    width: 100%;
}
.EditObject input {
    width: calc(100% - 16px);
}
</style>
