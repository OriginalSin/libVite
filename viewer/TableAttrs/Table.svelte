<script>
	import Draggable from '../Modal/Draggable.svelte';
	// import Draggable from '../Modal/Draggable.svelte';
	// import Modal from '../Modal/Modal.svelte';
	import './Table.css';
	import TableBody from './TableBody.svelte';
	import TableFoot from './TableFoot.svelte';
	import FindForm from './FindForm.svelte';
	import TableFindOper from './TableFindOper.svelte';
import Utils from '../Utils.js';

	import { onMount } from 'svelte';

	export let layerID;

let width = '', height = 460;
	// let layerID = data.layerID;
let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;
let lprops = layersByID[layerID]._gmx;
let attributes = lprops.properties.attributes;
	// let map = L.gmx.gmxMap.leafletMap;
	let showModal = true;
// let lprops;
// let attributes = [];
	let identityField;
	let orderBy;
	let orderdirection = 'DESC'; //'ASC';
	let foot = {layerID};
	let selectItems = {};
	let formsKeys = {};
	let selectCols;
	let items;
	let query;
	let count = 0,
		mPage,
		pStart = 0,
		cPage = 0,
		pSize = 20;
	let closeIcon = L.gmxUtil.setSVGIcon('close');

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
		foot = {...foot, loading: true};
		if (!lprops) {
			lprops = await Utils.getJson({cmd: 'GetLayerJson', path: 'Layer', pars:{LayerName: layerID}});
		}
		attributes = lprops.properties.attributes;
		identityField = lprops.properties.identityField;
		
		let attr = {
			layer: layerID,
			count: true
		};
		if (query) attr.query = query;
		count = await Utils.search(attr);
		delete attr.count;

		attr.page = pars.cPage || 0;
		attr.pagesize = pars.pSize || 20;
		attr.orderdirection = orderdirection;
		attr.orderBy = orderBy || identityField;

		let columns = [
			{"Value":"GeomIsEmpty([geomixergeojson])","Alias":"__GeomIsEmpty__"},
			{"Value":'[' + identityField + ']'}
		];
		lprops.properties.attributes.forEach(key => {
			columns.push({"Value":'[' + key + ']'});
		});
		attr.columns = JSON.stringify(columns);
		items = await Utils.search(attr);
		
		if (items) {
			let needChecked = !selectCols;
			if (needChecked) {
				selectCols = {};
				items.fields.forEach(k => selectCols[k] = true);
			}
			mPage = Math.floor(count / attr.pagesize);
			foot = {...foot, mPage, count, cPage: attr.page, pSize: attr.pagesize};
		}
		foot = {...foot, loading: undefined};
	};
	if (layerID) getPage({});

	onMount(() => {
		// thead.style.transform = 'translate(0, -2px)';
		// console.log('ggggggggg', attrsTableParent);
	});
/*	
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
	const closeMe = () => {
		map._TableAttrsDestroy(layerID);
		// $$self.$destroy();
console.log('closeMe');
	};
	const notify = (ev) => {
		const detail = ev.detail,
			key = detail.key,
			cmd = detail.cmd;

		switch(cmd) {
			case 'setPage':
				foot = {...foot, ...detail};
				getPage(foot);
				break;
			case 'selCols':
				if (key) {
					if (selectCols[key]) delete selectCols[key];
					else selectCols[key] = true;
				} else {
					items.fields.forEach(key => {
						if (!detail.flag) delete selectCols[key];
						else selectCols[key] = true;
					});
				}
				selectCols = {...selectCols};
				break;
			case 'selItem':
				let id = detail.id;
				if (selectItems[id]) delete selectItems[id];
				else selectItems[id] = detail.it;
				selectItems = {...selectItems};
				break;
			case 'selPageItems':
				items.values.forEach(it => {
					const id = it[items.indexes[identityField]];
					if (!detail.flag) delete selectItems[id];
					else selectItems[id] = it;
				});
				selectItems = {...selectItems};
				break;
			case 'sortItems':
				if (orderBy === key) orderdirection = orderdirection === 'DESC' ? 'ASC' : 'DESC';
				else { orderdirection = 'DESC'; orderBy = key; }
				getPage(foot);
				break;
			case 'formsKeys':
				if (formsKeys[key]) delete formsKeys[key];
				else formsKeys[key] = true;
				formsKeys = {...formsKeys};
				break;
			case 'find':
				query = detail.query || '';
				getPage(detail);
				break;
			case 'downloadLayer':
				let prp = {t: layerID};
				if (detail.format) prp.format = detail.format;
				if (query) prp.query = query;
				L.gmxUtil.layerHelper.downloadLayer(prp);
				break;
			case 'getSquare':
				// query = detail.query || '';
				// getPage(detail);
				break;
			default:
				break;
		}
console.log('notify', selectCols);
	};

</script>

<Draggable {width} {height}>

<div class='TableAttrs {open ? 'active' : ''}'>
	<div class="header">
		<span class="title">Таблица атрибутов слоя:</span>
		<span class="value">{lprops?.properties.title || ''}</span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>

	<div class="body {formsKeys.find ? 'findActive' : ''}">
		<span class="find-container"><FindForm {attributes} {formsKeys} on:notify={notify} /></span>
		<span class="top secondTable">
			<div><TableFindOper {layerID} {attributes} {selectItems} {selectCols} {items} on:notify={notify} /></div>
			<div><TableBody {layerID} {attributes} {items} {identityField} {selectItems} {selectCols} on:notify={notify} /></div>
			<div><TableFoot {foot} on:notify={notify} /></div>
		</span>

	</div>
</div>
</Draggable>

<style>
.TableAttrs {
	background-color: white;
	height: 100%;
}
.TableAttrs .close {
    position: absolute;
    right: 0px;
}
.TableAttrs .header .value{
	font-weight: bold;
}

.TableAttrs .body {
	cursor: default;
	display: flex;
}

.TableAttrs .body .find-container {
	padding: 4px;

    /* display: none; */
}
.TableAttrs .body.findActive .find-container {
	/* width: 300px; */
    /* display: inline-block; */
}
.TableAttrs .body .secondTable {
    width: calc(100% - 8px);
}
.TableAttrs .body.findActive .secondTable {
	width: calc(100% - 308px);
}

</style>
