<script>
import Draggable from '../Modal/Draggable.svelte';
import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from '../Utils.js';

export let attr = {};

// export 
let indexes = {};
// export let layerID = data.layerID;

let {layerID, id} = attr;
let fields = attr.indexes;
let data = [];
let contNode;

let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;
let props = layersByID[layerID]._gmx.properties;
let attributes = props.attributes;
if (!fields) fields = attributes;
	let drawingList;

let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;

const getItem = async (layerID, id) => {
	let res = await Utils.search({
		geometry: true,
		layer: layerID,
		query: '[gmx_id]=' + id
	});
	fields = res.fields;
	indexes = res.indexes;
	data = res.values[0];
	geoJSON = L.gmxUtil.geometryToGeoJSON(data[indexes.geomixergeojson], true, true);
};
id && getItem(layerID, id);

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	const key = id + '_' + layerID;
	// map._editObject.$destroy();
	map._destroyEditObject(key);
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

let geoInput;
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
const save = () => {
	const out = {};
	const inputs = contNode.getElementsByTagName('input');
	Object.values(inputs).forEach(inp => {
		out[inp.getAttribute('data-key')] = inp.value;
// console.log('inp', inp);
	});
console.log('save', out);
};
const del = (ev) => {
console.log('del', ev);
};

console.log('attributes', layerID, attr);

</script>

<Draggable>

<div class="EditObject" bind:this={contNode}>
	<div class="header"> 
		<span class="title">{id ? 'Редактировать' : 'Создать'} объект слоя: </span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body scrollbar">
		<table><tbody>
		<tr class="rawGeo">
			<td class="name">
				<span class="edit-obj-geomtitle">Геометрия</span><button on:click={setGeo} class="geom" />
			</td>
			<td class="val">
			{#if geoJSON}
				<span class="name">{geoJSON.type}</span>
				<span class="summary">({L.gmxUtil.getGeoJSONSummary(geoJSON)})</span>
			{/if}
			</td>
		</tr>
		{#each (fields || []) as name, i}
		{@const val = data[indexes[name]]}
			{#if name !== 'geomixergeojson'}
		
		<tr>
			<td class="name">
				<span>{name}</span>
			</td>
			<td class="val">
				<input type="text" data-key={name} value={val || ''} />
			</td>
		</tr>
			{/if}
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
		<button on:click={save} class="save">{id ? 'Изменить' : 'Создать'}</button>
		{#if id}<button on:click={del} class="save">Удалить</button>{/if}
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
