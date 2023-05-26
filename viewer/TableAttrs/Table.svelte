<script>
	import Modal from '../Modal/Modal.svelte';
	import Find from './Find.svelte';
	import { onMount } from 'svelte';

	export let data;

	let layerID = data.layerID;
	let showModal = true;
	let lprops;
	let identityField;
	let orderBy;
	let orderdirection = 'DESC'; //'ASC';
	let selectItems = {};
	let items;
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
	const selItem = (it) => {
		const id = it[items.indexes[identityField]];
		if (selectItems[id]) delete selectItems[id];
		else selectItems[id] = it;
		selectItems = {...selectItems};
	};
	const showItem = async (it) => {
		const id = it[items.indexes[identityField]];
		const sprefix = prefix + 'VectorLayer/Search.ashx?WrapStyle=none&geometry=true&out_cs=4326&layer=' + layerID;
		const sr = await fetch(sprefix + '&query=[' + identityField + ']=' + id).then(_respJson);
		if (sr.Status  === 'ok') {
			const pt = sr.Result.values[0];
			const geo = pt[pt.length - 1];
			const geoJson = L.geoJson(L.gmxUtil.geometryToGeoJSON(geo));
			L.gmx.gmxMap.leafletMap.fitBounds(geoJson.getBounds());
		}
	};
	const editItem = (it) => {
console.log('editItem', it);
	};

</script>

<!--button on:click={() => (showModal = true)}>
	show modal
</button-->

<Modal bind:showModal>


<div class='TableAttrs {open ? 'active' : ''}'>
	<div class="header">
		<span class="title">Таблица атрибутов слоя:</span>
		<span class="value">{lprops?.properties.title || ''}</span>
		<button type="button" class="close"></button>
	</div>


<div class="">
	<div>
		<table>
			<tbody>
<tr>
	<td class="find-container">
		<Find />
	</td>

<td class="top">
	<div class="buttons">
		<div class="button-cont">
			<button class="find">Найти объекты</button>
			<button class="update">Обновить объекты</button>
			<button class="add">Добавить объекты</button>
			<button class="list">Изменить колонки</button>
		</div>
		<table class="attrsSelectedCont">
		<tbody>
		<tr>
			<td class="col_1">
			<input on:change={selPageItems} type="checkbox" /><span>Выделить все на странице</span>
			<span class="hiddenCommands {Object.keys(selectItems).length ? 'active' : ''}">Выбрано объектов:
				<span class="selectedCount">{Object.keys(selectItems).length}</span>
				<button class="del">Удалить</button>
				<button class="copy">Скопировать</button>
			</span>
			</td>
			<td class="col_2">
			<button class="show-columns">Показывать колонки</button>
			<div class="attrsColumnsList">
				<div class="all">
					<label title="Колонки:"><input type="checkbox" checked />Колонки:</label>
				</div>
				<div class="cols">
					{#each (items?.fields || []) as key, col}
					{@const type = items.types[col]}
					<div class="field"><label title={key} class="col_{col}"><input type="checkbox" checked />{key}</label></div>
					{/each}
				</div>
			</div>
			</td>
		</tr>
		</tbody>

		</table>
	</div>

	<div class="attrsTableBody">
		<div on:scroll={scrollMe} class="scrollbar scrollTable">
			<table class="table-scroll fixed_header scrollbar">
			<thead bind:this={thead}>
				<tr>
					{#each (items?.fields || []) as key}
					{@const col = items.indexes[key]}
					{@const type = items.types[col]}
					{#if key === '__GeomIsEmpty__'}
					<th class="oper"></th>
					{:else}
					<th class="col_{col}">{key}</th>
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
					{:else}
						<td class="col_{col}">{val}</td>
					{/if}
					{/each}
				</tr>
				{/each}
			</tbody>
			</table>
		</div>
	</div>
</td>
</tr>
</tbody>
</table>

		<table class="table-foot">
		<tbody>
		<tr>
			<td class="col_1">
				<div>
				<span class="cur">{cPage * pSize + 1}-{(cPage +1 ) * pSize > count ? count : (cPage +1 ) * pSize}</span><span class="count">({count})</span>
				<div class="fileBrowser-progress {loading ? 'active' : ''}"></div>
				</div>
			</td>
			<td class="col_2">
				<div class="tablePages">
				<button on:click={() => setPage(0)} class="first {pStart > 0 ? 'active' : ''}" title="Первая страница" />
				<button on:click={() => setPage(cPage - 10)} class="prev {pStart > 0 ? 'active' : ''}" title="Предыдущие 10 страниц" />
					{#each Array.from(Array(10),(x,i)=>i) as i}
					{@const nm = i + pStart}
					{#if nm >= 0 && nm <= mPage}
<button on:click={() => setPage(nm)} class="pn {cPage === nm ? 'active' : ''}">{nm + 1}</button>
					{/if}
					{/each}
				<button on:click={() => setPage(cPage + 10)} class="next {pStart + 10 < mPage ? 'active' : ''}" title="Следующие 10 страниц" />
				<button on:click={() => setPage(Number.POSITIVE_INFINITY)} class="last {pStart + 10 < mPage ? 'active' : ''}" title="Последняя страница" />
				</div>
			</td>
			<td class="col_3">
				<select on:change={setPageSize}>
					{#each [10, 20, 50, 100, 200, 500] as i}
					<option value={i} selected={i === pSize}>{i}</option>
					{/each}
				</select>

			</td>
		</tr>
		</tbody>
		</table>



		<div class="foot-buttons">
			<span class="buttonLink attrsDownloadLink" data-format="Shape">Скачать shp</span><span class="buttonLink attrsDownloadLink" data-format="csv">Скачать csv</span><span class="buttonLink attrsDownloadLink" data-format="geojson">Скачать geojson</span><span class="buttonLink createLayerLink">Создать слой</span><span class="buttonLink copyObjectsLink">Копировать объекты</span><span class="buttonLink attrs-table-square-link" data-original-title="" title="">Суммарная площадь</span>
		</div>

</div>
</Modal>

<style>
.attrsSelectedCont .hiddenCommands {
	visibility: hidden;
}
.attrsSelectedCont .hiddenCommands.active {
	visibility: visible;
}

.tablePages {
    user-select: none;
}
.attrsSelectedCont .hiddenCommands .selectedCount,
.tablePages .header .value{
	font-weight: bold;
}

.tablePages button.next.active,
.tablePages button.last.active,
.tablePages button.first.active,
.tablePages button.prev.active {
	visibility: visible;
	pointer-events: visible;
}
.tablePages button.next,
.tablePages button.last,
.tablePages button.first,
.tablePages button.prev {
	visibility: hidden;
}
.tablePages button.active {
	pointer-events: none;
	font-weight: bold;
}

.buttons {
    font-size: 12px;
}
button {
	outline: none;
}
.buttons button {
    text-decoration: underline;
	padding: 0;
}
.attrsSelectedCont .col_2 {
    text-align: right;
}
.buttons .attrsColumnsList {
    display: none;
}
.buttons .attrsColumnsList.active {
    display: block;
}

.TableAttrs table {
    width: 100%;
}
.TableAttrs table th {
    text-align: center;
}

.table-foot .col_1 {
    width: 25%;
}
.table-foot .col_1 .cur {
    padding-right: 6px;
}
.table-foot .col_3 {
    text-align: right;
	width: 60px;
}
.table-foot .col_2 {
    text-align: center;
}
.table-foot .col_2 .pn {
	padding: 2px
}
.table-foot .col_2 button.first {
    background: url(../img/first.png);
}
.table-foot .col_2 button.prev {
    background: url(../img/prev.png);
}
.table-foot .col_2 button.next {
    background: url(../img/next.png);
}
.table-foot .col_2 button.last {
    background: url(../img/last.png);
}
.table-foot .col_2 button.first,
.table-foot .col_2 button.prev,
.table-foot .col_2 button.next,
.table-foot .col_2 button.last {
	width: 18px;
    height: 14px;
    border: none;
	padding: 0px;
	margin-bottom: -7px;
	background-repeat: no-repeat;
}

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
  
.scrollTable {
	height: 320px;
    overflow: auto;
}
.scrollTable table {
	border-collapse: collapse;
	

}
.scrollTable thead {
	background-color: black;
    color: white;
}
.scrollTable th, .scrollTable td {
	text-align: left;
	width: 200px;
    padding: 1px 5px 2px 5px;
    border: 1px solid #dedede;
    font-size: 12px;
    font-weight: normal;
}
.scrollTable .oper button.show.active {
	display:inline-block;
}
.scrollTable .oper button.show {
    background: url(../img/enlarge-circle.svg);
	display: none;
}
.scrollTable .oper button.edit {
    background: url(../img/pen.svg);
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
