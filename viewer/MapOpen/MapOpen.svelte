<script>
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from '../Utils.js';

export let attr = {};

// export 
// export let layerID = data.layerID;

let {layerID, id, width} = attr;
let indexes = attr.indexes;
let data = [];
let contNode;
let thead;

let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;
let props = layersByID[layerID]?._gmx.properties || {};
let attributes = props.attributes;
let fields;
if (!fields) fields = attributes;
if (!indexes && fields) indexes = Utils.getIndexes(fields);
	let drawingList;

let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;
const vars = {title: 'Title', owner: 'Owner', modification: 'LastModificationDateTime'};

const getMaps = async (pars) => {
	pars = pars || {
		desc: true,
		order: 'modification',
		limit: 50
		// skip: 18000
	};
	data = await Utils.getJson({cmd: 'SearchMaps', path: 'Map', ext: '', pars});
console.log('res', data);
	// let res = await Utils.search({
		// geometry: true,
		// layer: layerID,
		// query: '[gmx_id]=' + id
	// });
	// fields = res.fields;
	// indexes = res.indexes;
	// data = res.values[0];
	// geoJSON = L.gmxUtil.geometryToGeoJSON(data[indexes.geomixergeojson], true, true);
};
getMaps();
console.log('getItem', L.gmx);

// L.gmx.gmxDrawing.on('drawstop', (ev) => {
	// features = gmxDrawing.getFeatures();
// });
const closeMe = () => {
	map._MapOpenDestroy();
};
const sortItems = (pt) => {
console.log('sortItems', pt);

};
let activeNm;
const selItem = (pt, i) => {
	activeNm = i;
console.log('selItem', pt);
}
const delItem = (pt) => {
console.log('delItem', pt);
};

let geoInput;
const editDescr = (ev) => {
	showModal = true;
/*	
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
*/
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

// console.log('attributes', layerID, attr);

</script>

<Draggable {width}>

<div class="MapOpen" bind:this={contNode}>
	<div class="header"> 
		<span class="title">Список карт: </span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body scrollbar">
		<table>
		<thead bind:this={thead}>
		<tr>
			<th class="col_1"><button on:click={() => sortItems('title')}>Имя</button></th>
			<th class="col_2"><button on:click={() => sortItems('owner')}>Владелец</button></th>
			<th class="col_3"><button on:click={() => sortItems('modification')}>Последнее изменение</button></th>
			<th class="col_4"></th>
		</tr>
		</thead>
		<tbody>
		{#each (data || []) as it, i}
			{@const dt = new Date(it.LastModificationDateTime * 1000).toLocaleDateString()}
		<tr class="raw {i === activeNm ? 'active':''}">
			<td class="col_1"><button on:click={() => selItem(it, i)} title="Загрузить">{it.Title}</button></td>
			<td class="col_2"><span>{it.Owner}</span></td>
			<td class="col_3"><span>{dt}</span></td>
			<td class="col_4"><button on:click={() => delItem(it)} title="Удалить" /></td>
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
		<button on:click={save} class="save">{id ? 'Изменить' : 'Создать'}</button>
		{#if id}<button on:click={del} class="save">Удалить</button>{/if}
	</div>
</div>

</Draggable>

<style>
.MapOpen {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.MapOpen .header {
    font-weight: bold;
}
.MapOpen .title {
	pointer-events: none;
}
.MapOpen .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}

.MapOpen .body {
    height: 400px;
    overflow-y: auto;
}
.MapOpen button.geom {
    background-image: url(/img/choose2.png);
    background-repeat: no-repeat;
    display: inline-block;
}

.MapOpen table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #dddddd;
    table-layout: fixed;
}

.MapOpen table th,
.MapOpen table td {
    max-width: 60px;
    border-bottom: 1px solid #D0D8DF;
    border-top: 1px solid #D0D8DF;
}
.MapOpen table td {
	color: #999999;
}
/*
.MapOpen table th.col_0,
.MapOpen table td.col_0 {
	content: '';
    max-width: 20px;
    width: 20px;
    height: 20px;
    display: inline-flex;
}
*/
.MapOpen table th.col_1,
.MapOpen table td.col_1 {
	color: unset;
    max-width: 300px;
}
.MapOpen table td button {
    white-space: break-spaces;
    text-align: left;
	padding: 0;
	display: inline-block;
}
.MapOpen table td.col_1 button {
	margin-left: 8px;
}
.MapOpen table td.col_1 button::before {
	content:"";
    width: 12px;
    height: 12px;
	display: inline-flex;
    background-repeat: no-repeat;
}
.MapOpen table td.col_1 button::before {
    background-image: url(/img/collapse-arrow-right.gif);
}
.MapOpen table tr.active td.col_1 button::before {
    background-image: url(/img/collapse-arrow-se.png);
}
.MapOpen table td.col_4 {
    background-image: url(/img/recycle.png);
    background-repeat: no-repeat;
}

.MapOpen input {
    width: calc(100% - 16px);
}
</style>
