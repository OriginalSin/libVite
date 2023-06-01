<script>
	import EditObject from '../EditObject/EditObject.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layerID;
	export let items = {};
	export let attributes = [];
	export let selectItems = {};
	export let selectCols = {};

	let map = L.gmx.gmxMap.leafletMap;
	let closeIcon = L.gmxUtil.setSVGIcon('close');

	function selPageItems(ev) {
		dispatch('notify', {cmd: 'selPageItems', flag: ev.target.checked});
	}
	// checked=false
	const find = (ev) => {
console.log('find', ev);
		dispatch('notify', {cmd: 'formsKeys', key: 'find' });
	};
	const update = (ev) => {
console.log('update', ev);
		// dispatch('notify', {cmd: 'setPage', cPage});
	};
	const add = (ev) => {
console.log('add', ev);
		if (map._editObject) map._editObject.$destroy();
		map._editObject = new EditObject({
			target: document.body,
			props: {
				layerID,
				attributes,
				onSelect: (it) => {
					// geoJSON = it.toGeoJSON().geometry;
					map._editObject.$destroy();
console.log('onSelect', it);
				}
			}
		});
		// dispatch('notify', {cmd: 'setPage', cPage});
	};
	const list = (ev) => {
console.log('list', ev);
	};
	const del = (ev) => {
console.log('del', ev);
	};
	const copy = (ev) => {
console.log('copy', ev);
	};
	let attrsColumnsList;
	const show = (ev) => {
		let classList = attrsColumnsList.classList;
		if (classList.contains('active')) classList.remove('active');
		else classList.add('active');
console.log('show', items);
	};
	const checkAll = (ev) => {
		dispatch('notify', {cmd: 'selCols', flag: ev.target.checked});
console.log('checkAll', ev);
	};
	const check = (key) => {
		dispatch('notify', {cmd: 'selCols', key});
console.log('check', key);
	};
	
</script>

<section class="TableFindOper">

<div class="buttons">
	<div class="button-cont">
		<button on:click={find} class="find">Найти объекты</button>
		<button on:click={update} class="update">Обновить объекты</button>
		<button on:click={add} class="add">Добавить объекты</button>
		<button on:click={list} class="list">Изменить колонки</button>
	</div>
	<table class="attrsSelectedCont">
	<tbody>
	<tr>
		<td class="col_1">
		<input on:change={selPageItems} type="checkbox"  /><span>Выделить все на странице</span>
		<span class="hiddenCommands {Object.keys(selectItems).length ? 'active' : ''}">Выбрано объектов:
			<span class="selectedCount">{Object.keys(selectItems).length}</span>
			<button on:click={del} class="del">Удалить</button>
			<button on:click={copy} class="copy">Скопировать</button>
		</span>
		</td>
		<td class="col_2">
		<button on:click={show} class="show-columns">Показывать колонки</button>
		<div bind:this={attrsColumnsList} class="attrsColumnsList scrollbar">
			<div class="all">
				<label title="Колонки:"><input on:change={checkAll} type="checkbox" checked />Колонки:</label>
			</div>
			<div class="cols">
				{#each (items?.fields || []) as key, col}
				{@const checked = selectCols[key] ? 'checked' : ''}
				
				{#if key !== '__GeomIsEmpty__'}
<div class="field"><label title={key} class="col_{col}"><input on:change={() => check(key)} type="checkbox" {checked} />{key}</label></div>
				{/if}
				{/each}
			</div>
		</div>
		</td>
	</tr>
	</tbody>

	</table>
</div>
</section>

<style>

.TableFindOper table {
    width: 100%;
}
.TableFindOper table td.col_1 {
    width: 80%;
}
.TableFindOper table td.col_2 {
    width: 20%;
}
.TableFindOper .attrsColumnsList {
    display: none;
	text-align: left;
	white-space: nowrap;
	max-height: 310px;
    position: absolute;
    z-index: 4000;
    background-color: white;
    overflow-y: auto;
	box-shadow: rgba(100, 100, 100, 0.7) 0px 0px 3px;
	    margin: 4px 7px 0 0;
    padding: 5px;

}
.TableFindOper .attrsColumnsList.active {
    display: block;
}
.TableFindOper .attrsColumnsList .cols {
    margin-left: 10px;
}
.TableFindOper .attrsColumnsList .all {
    height: unset;
}
.TableFindOper .buttons {
    font-size: 12px;
}

.TableFindOper .buttons button {
    text-decoration: underline;
	padding: 0;
}
.attrsSelectedCont .hiddenCommands {
	visibility: hidden;
}
.attrsSelectedCont .hiddenCommands.active {
	visibility: visible;
}

.attrsSelectedCont .hiddenCommands .selectedCount {
	font-weight: bold;
}

.attrsSelectedCont .col_2 {
    text-align: right;
}

</style>
