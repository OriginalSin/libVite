<script>
	import EditObject from '../EditObject/EditObject.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import { onMount } from 'svelte';
import Utils from '../Utils.js';

	export let layerID;
	// export let attributes;
	export let items;
	export let selectItems = {};
	export let selectCols = {};
	export let identityField;

	// let layerID = data.layerID;
	let map = L.gmx.gmxMap.leafletMap;
	let showModal = true;
	let lprops;
	// let identityField;
	let orderBy;
	let orderdirection = 'DESC'; //'ASC';
	// let selectItems = {};
	let loading;
	let count = 0,
		mPage,
		pStart = 0,
		cPage = 0,
		pSize = 20;
	
	const prefix = 'https://maps.kosmosnimki.ru/';
	const showInfo = L.gmxUtil.Notification;
	const _respJson = (resp) => {
		if (resp.status === 200) return resp.json();
		else {
			showInfo.view('Серверная ошибка: ' + resp.status, 'error');
		}
	};

	onMount(() => {
		thead.style.transform = 'translate(0, -2px)';
		// console.log('ggggggggg', attrsTableParent);
	});
	let thead;
	const scrollMe = (ev) => {
		const target = ev.target;
		thead.style.transform = 'translate(0, ' + (target.scrollTop - 2) + 'px)';
console.log('scrollMe', target.scrollTop);
	};

	const selItem = (it) => {
		const id = it[items.indexes[identityField]];
		dispatch('notify', {cmd: 'selItem', id, it});
	};
	const showItem = async (it) => {
		const id = it[items.indexes[identityField]];
		const res = await Utils.search({
			geometry:true,
			out_cs:4326,
			query: '[' + identityField + ']=' + id,
			layer: layerID
		});
		if (res && res.values && res.values.length) {
			const pt = res.values[0];
			const geo = pt[res.indexes.geomixergeojson];
			const geoJson = L.geoJson(L.gmxUtil.geometryToGeoJSON(geo));
			L.gmx.gmxMap.leafletMap.fitBounds(geoJson.getBounds());
		}
	};
	const editItem = (data) => {
		const id = data[items.indexes[identityField]];
		const key = id + '_' + layerID;
		map._showEditObject({
			layerID,
			id,
			identityField,
			indexes: items.indexes,
			onSelect: (it) => {
				// geoJSON = it.toGeoJSON().geometry;
				// map._editObject.$destroy();
				map._destroyEditObject(key);
console.log('onSelect', it);
			}
		});
console.log('editItem', data);

	};
	const sortItems = (key) => {
		dispatch('notify', {cmd: 'sortItems', key});
	};

</script>

<section class="TableBody">

<div class="attrsTableBody">
	<div on:scroll={scrollMe} class="scrollbar scrollTable">
		<table class="table-scroll fixed_header scrollbar">
		<thead bind:this={thead}>
			<tr>
				{#each (items?.fields || []) as key}
				{@const col = items.indexes[key]}
				{#if key === '__GeomIsEmpty__'}
				<th class="oper"></th>
				{:else if selectCols[key]}
				<th class="col_{col}">
				<button on:click={() => sortItems(key)} title="Сортировать">
				{key}
				</button>
				</th>
				{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each (items?.values || []) as it, raw}
				{@const id = it[items.indexes[identityField]]}
			<tr class="raw_{raw} {id}">
				{#each (items?.fields || []) as key}
				{@const col = items.indexes[key]}
				{@const type = items.types[col]}
				{@const val = it[col]}
				{#if key === '__GeomIsEmpty__'}
				<td class="oper">
				<div>
				<input on:change={() => selItem(it)} checked={selectItems[id] ? true : false} type="checkbox" title="Удалить" />
				<button on:click={() => showItem(it)} class="show {val ? '' : 'active'}" title="Показать" />
				<button on:click={() => editItem(it)} class="edit" title="Редактировать" />
				</div>
				</td>
				{:else if selectCols[key]}
					<td class="col_{col}">{val}</td>
				{/if}
				{/each}
			</tr>
			{/each}
		</tbody>
		</table>
	</div>
</div>
</section>

<style>
.TableBody {
	background-color: white;
}
/*
tfoot,
.foot-buttons,
.find-container {
	display: none;
}
.find-container.active {
	display: block;
}
.fileBrowser-progress.active {
    display: inline-block;
}
.fileBrowser-progress {
    background: url(../img/progress.gif);
    width: 16px;
    height: 16px;
    display: none;
    vertical-align: middle;
    margin: 0px 0px 3px 3px;
}

.fixed_header td,
.fixed_header th {
}
*/
.scrollTable {
	height: 320px;
	width: calc(100% - 4px);

	/* max-width: calc(var(--tableAttrs-width) - 10px); */
    overflow: auto;
}
.scrollTable table {
	border-collapse: collapse;
	

}
.scrollTable thead {
	background-color: black;
    color: white;
}
.scrollTable th button {
    text-decoration: underline;
	padding: 0;
	background-color: transparent;
    color: white;
}
.scrollTable th, .scrollTable td {
	text-align: left;
	width: 200px;
    padding: 1px 5px 2px 5px;
    border: 1px solid #dedede;
    font-size: 12px;
    font-weight: normal;
	user-select: text;
}
.scrollTable .oper button.show.active {
	display:inline-block;
}
.scrollTable .oper button.show {
    background: url(/img/enlarge-circle.svg);
	display: none;
}
.scrollTable .oper button.edit {
    background: url(/img/pen.svg);
}
.scrollTable .oper button.show,
.scrollTable .oper button.edit {
	width: 12px;
    height: 12px;
    border: none;
	padding: 0px;
	margin-bottom: -7px;
	background-repeat: no-repeat;
}
.attrsTableBody .oper div {
	display: inline-block;
	width: 52px;
}
</style>
