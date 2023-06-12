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
/*
	const getPage = async (pars) => {
console.log('pars', pars);
		loading = true;
		if (!lprops) {
			let url = prefix + 'Layer/GetLayerJson.ashx?WrapStyle=none&LayerName=' + layerID;
			lprops = await fetch(url).then(_respJson);
			if (lprops.Status === 'error') showInfo.view('Серверная ошибка: ' + lprops.ErrorInfo.ErrorMessage, 'error');
			lprops = lprops.Result;
		}
		// else {
			// lprops = lprops.Result;
		identityField = lprops.properties.identityField;
		let sprefix = prefix + 'VectorLayer/Search.ashx?WrapStyle=none&layer=' + layerID;
		let sr = await fetch(sprefix+ '&count=true').then(_respJson);
		if (sr.Status === 'ok') count = sr.Result || 0;
		let url = prefix + 'VectorLayer/Search.ashx';
		let columns = [
			{"Value":"GeomIsEmpty([geomixergeojson])","Alias":"__GeomIsEmpty__"},
			{"Value":'[' + identityField + ']'}
		];
		lprops.properties.attributes.forEach(key => {
			columns.push({"Value":'[' + key + ']'});
		});

		let params = {
			page: cPage,
			pagesize: pSize,
			orderBy: orderBy || identityField,
			orderdirection,
			layer: layerID,
			columns,
			WrapStyle: 'none'
		};
		// url += '&page=' + cPage;
		// url += '&pagesize=' + pSize;
		// url += '&orderBy=' + (orderBy || identityField);
		// url += '&orderdirection=' + orderdirection;
//[{"Value":"GeomIsEmpty([geomixergeojson])","Alias":"__GeomIsEmpty__"},{"Value":"[gmx_id]"},
// {"Value":"[region]"},{"Value":"[forestry]"},{"Value":"[district_f]"},{"Value":"[district]"},{"Value":"[kv]"},{"Value":"[area]"},{"Value":"[id]"}]
        const fd = new FormData();
        fd.append('WrapStyle', 'None');
        fd.append('layer', layerID);
        fd.append('columns', JSON.stringify(columns));
        fd.append('orderdirection', orderdirection);
        fd.append('orderBy', orderBy || identityField);
        fd.append('pagesize', pSize);
        fd.append('page', cPage);

		sr = await fetch(url, {method: 'POST', mode: 'cors', credentials: 'include', body: fd}).then(_respJson);
		if (sr.Status === 'ok') {
			items = sr.Result || 0;
			items.indexes = items.fields.reduce((a, c, i) => {
				a[c] = i;
				return a;
			}, {});
			// items.rawKeys = items.fields.filter(k => k !== identityField);
			// items.rawKeys.unshift(identityField);
			mPage = Math.floor(count / pSize);
		}
		loading = undefined;

console.log('getPage', lprops, count, items);

		// }

		// const lprops = await fetch(prefix + 'Layer/GetLayerJson.5ashx?WrapStyle=none&LayerName=' + pars.layerID).then(_respJson);
	};
*/
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
/*
	const setPageSize = (ev) => {
		const target = ev.target;
		pSize = target.options[target.selectedIndex].value;
console.log('setPageSize', pSize);
		getPage({});
	};
	const setPage = (nm) => {
		cPage = nm;
		mPage = Math.floor(count / pSize);
		if (cPage < 0) cPage = 0;
		else if (cPage * pSize > count) cPage = Math.floor(count / pSize);
		pStart = 10 * Math.floor(cPage / 10);
		const d = mPage - pStart - 10;
		if (d <  0) pStart += d + 1;
console.log('setPage', pStart, mPage);
		getPage({});
		selectItems = {...selectItems};
	};
	if (layerID) {
		getPage({});
		// setPage(0);
	}

	const selPageItems = (ev) => {
		const target = ev.target;
		if (!target.checked) selectItems = {};
		else {
			items.values.forEach(it => {
				const id = it[items.indexes[identityField]];
				selectItems[id] = it;
			});
		}
		selectItems = {...selectItems};
	}
*/
	const selItem = (it) => {
		const id = it[items.indexes[identityField]];
		dispatch('notify', {cmd: 'selItem', id, it});
		// if (selectItems[id]) delete selectItems[id];
		// else selectItems[id] = it;
		// selectItems = {...selectItems};
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
/*
		// const id = it[items.indexes[identityField]];
		if (map._editObject) map._editObject.$destroy();
		map._editObject = new EditObject({
			target: document.body,
			props: {
				data,
				indexes: items.indexes,
				layerID,
				onSelect: (it) => {
					// geoJSON = it.toGeoJSON().geometry;
					map._editObject.$destroy();
console.log('onSelect', it);
				}
			}
		});
*/
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
