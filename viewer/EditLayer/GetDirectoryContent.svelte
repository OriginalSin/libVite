<script>
import DropFile from '@svelte-parts/drop-file'
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from '../Utils.js';
import {_drivesInfo, _userInfo} from '../stores.js';

export let attr = {};

// export let data = [];
// export let indexes = {};
// export let layerID; 

let {layerID, width = 800, height = 460} = attr;
// let layerID = data.layerID;
let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;

let properties = layersByID[layerID]._gmx.properties;
// let attributes = props.attributes;
// let attrTypes = props.attrTypes;
	let drawingList;
let TemporalPeriods = properties.TemporalPeriods || [];


let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;

let props = {};
let SourceType = 'Файл';
let GeometryType = 'linestring';
let IsRasterCatalog = false;
let isOpenMaxPeriod = false;
let isOpenShablon = false;
let isQuicklook = false;
let TemporalLayer = false;
let Quicklook;
let colsArr = [];
let drives;
let folder = '';
let folderMap;
let folderCont = [];
let userInfo;
let files;
let progressbar;
let foot;
 let fileOver = false;
let pathCount = 0;

const onDrop = (arr) => {
	fileOver = false
	files = arr;
	// sendFiles(files);
}

const dropFiles = e => {
  files = e.dataTransfer.files;
}
const sendFiles = async files => {
	foot.classList.add('active');
	let res = await Utils.upload(files, folder, progressbar);
	foot.classList.remove('active');
	if (res.length) getFolder(folder);
}
$: if (files) sendFiles(files);

const getFolder = async it => {
	folder = it;
	let arr = await Utils.getDirectoryContent(folder);
	if (Array.isArray(arr)) {
		pathCount = folder.split('/').filter(it => it).length - 1;
		folderCont = sortFolderCont(arr);
	}
};

_userInfo.subscribe(value => {
	if (value.Folder) {
		folderMap = value.Folder + '/Maps/' + L.gmx.gmxMap.properties.title + '/';
		userInfo = value;
		getFolder(folderMap);
	}
});
_drivesInfo.subscribe(value => {
	drives = value;
});

let sortAttr = {
	key: 'Name',
	desc: false
};
const sortFolderCont = (arr) => {
	const desc = sortAttr.desc ? 1 : -1;
	const key = sortAttr.key;
	return arr.sort((a, b) => {
		let aa = a[key] || '', bb = b[key] || '';
		let nn = aa.localeCompare && bb.localeCompare ? aa.localeCompare(bb) : aa - bb;
		return (+b.Directory) - (+a.Directory) || (desc * nn);
	});
};
const pathCount1 = () => {
	return folder.replace(/\\/g, '').split('/').length - 1;
};
const sortBy = (k) => {
	if (sortAttr.key === k) sortAttr.desc = !sortAttr.desc;
	sortAttr.key = k;
	folderCont = sortFolderCont(folderCont); 
};

let newFolderShow;
const addFolder = async (ev) => {
	let name = ev.target.previousElementSibling.value;
	if (name && await Utils.createFolder(folder + name) === 'ok') getFolder(folder);
};
const goParent = () => {
	let name = folder.replace(/([^\/]+\/)$/, '');
	if (name) getFolder(name);
};
const goMain = () => {
	getFolder(userInfo.Folder);
console.log('userInfo', userInfo);
};

const getColumnsOption = (f) => {
	// f = f.toUpperCase();
	return colsArr.map(it => {
		const n = it.Name;
		return '<option value="' + n + '" ' + (f === n.toUpperCase() ? 'selected' : '') + '>' + n + '</option>';
	});
};

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	map._directoryContent.$destroy();
	// map._destroyEditLayer(layerID);
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
	
	// if (map._createDescr) map._createDescr.$destroy();
	// map._createDescr = new CreateDescr({
		// target: document.body,
		// props: {
			// showModal,
			// onSelect: (it) => {
			// },
			// left: 200,
			// top: 200
		// }
	// });
console.log('editDescr', ev);
};
const save = (ev) => {
console.log('save', ev);
};
const del = (ev) => {
console.log('del', ev);
};
let tab = 'main';
const selTab = (ev) => {
	const tabNode = ev.target.parentNode;
	tab = tabNode.className;
console.log('del', tab);
};
const goSubFolder = (it) => {
	getFolder(folder + it.Name + '/');
console.log('goSubFolder', folder, it);
};
const goChoose = (ev) => {
console.log('goChoose', ev);
};

console.log('attributes', layerID, attr);
// {@debug	drives}

</script>

<Draggable {width} {height}>


<div class="GetDirectoryContent">
	<div class="header">
		<span class="title">{layerID ? 'Файл: ' : 'Создать векторный слой'}<b>{props.Title || ''}</b></span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body">
		<div class="line folders">
			{#each (drives || []) as it}
			<button on:click={() => getFolder(it)}>{it}</button>
			{/each}
			<button on:click={() => getFolder(folder)} title="Обновить" class="reload img" />
			<button on:click={() => getFolder(folderMap)} title="Директория проекта" class="home img" />
			<button on:click={() => newFolderShow = !newFolderShow} title="Новая папка" class="newfolder img" />
			<span class="newfolder {newFolderShow ? 'active':''}">
				<input /><button on:click={addFolder}>Создать</button>
			</span>
		</div>

		<div class="currentDir">
			<span class="fileBrowser-pathElem">{folder}</span>
			<br>
			<label class="filter">Фильтр: <input type="text" /></label>
		</div>

		<div class="table scrollbar">
			<table><thead>
				<tr>
					<th class="col_0"><button on:click={() => getFolder(userInfo.Folder)}>\</button></th>
					<th class="col_1"><button on:click={() => sortBy('name')}>Имя</button></th>
					<th class="col_2"><button on:click={() => sortBy('type')}>Тип</button></th>
					<th class="col_3"><button on:click={() => sortBy('Size')}>Размер</button></th>
					<th class="col_4"><button on:click={() => sortBy('Date')}>Дата</button></th>
				</tr>
				</thead>
			<tbody>
				
				{#if pathCount > 0}
				<tr>
					<td class="col_1" colspan=5><button on:click={goParent} class="rawButton img">[..]</button></td>
				</tr>
				{/if}
			{#each (folderCont || []) as it, i}
				{@const date = new Date(it.Date * 1000).toLocaleString()}
				{@const size = Utils.formatBytes(it.Size)}
				{@const name = it.Name.match(/([^\.]+)/)[0]}
				{@const type = it.Name.match(/\.([^.]+)$|$/)[1]}
				
				{@const choose = type === 'geojson' || type === 'shp' || type === 'tab'}
				{@const up = it.Directory1}
				{#if it.Directory}
				<tr on:click={() => goSubFolder(it)}>
					<td class="col_0"></td>
					<td class="col_1 folder">{it.name}</td>
					<td class="col_2"></td>
					<td class="col_3">Папка</td>
					<td class="col_4">{it.date}</td>
				</tr>
				{:else}
				<tr>
					<td class="col_0">{#if choose}<button class="choose img" on:click={goChoose} />{/if}</td>
					<td class="col_1">{it.name}</td>
					<td class="col_2">{it.type}</td>
					<td class="col_3">{it.size}</td>
					<td class="col_4">{it.date}</td>
				</tr>
				{/if}
			{/each}
			</tbody></table>
		</div>
	</div>

	<div bind:this={foot} class="foot">
		<input bind:files multiple type="file" />
		<DropFile onDrop={onDrop} onEnter={() => fileOver = true} onLeave={() => fileOver = false}>
			<div bind:this={progressbar} class="progressbar" />
			<span class="dropTitle {`drop-zone ${fileOver ? 'over' : ''}`}">
			{#if fileOver}
			  Drop it!
			{:else}
			  Перетащите файлы сюда
			{/if}
			</span>
		</DropFile>

	</div>
<!-- div bind:this={dropBox} class="dragFiles" on:drop|capture|stopPropagation|preventDefault={dropFiles}>
	<div bind:this={progressbar} class="progressbar" style="width: 75%;">
	</div>
</div -->
</div>

</Draggable>

<style>
.GetDirectoryContent {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.GetDirectoryContent .header {
    font-weight: bold;
}
.GetDirectoryContent .header .title {
	pointer-events: none;
}
.GetDirectoryContent .header .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}

.GetDirectoryContent .folders button {
    border: 1px solid;
    border-radius: 0;
    /* border-collapse: collapse; */
    outline: none;
    margin: 0;
    padding: 0 6px;
    height: 20px;
    /* display: inline-flex; */
    font-family: Tahoma, Arial, sans-serif;
}
.GetDirectoryContent button.img {
    background-repeat: no-repeat;
    border: unset;
    border-radius: unset;
	padding: 0;
    /* margin-left: 4px; */
    width: 15px;
    height: 15px;
    top: 2px;
    position: relative;
    margin-left: 6px;
    /* top: 5px; */
    /* left: -8px; */
    background-size: contain;

}
.GetDirectoryContent button.reload {
    background-image: url(/img/reload.png);
}

.GetDirectoryContent button.home {
    background-image: url(/img/home.png);
}

.GetDirectoryContent button.newfolder {
    background-image: url(/img/newfolder.png);
}
.GetDirectoryContent .folders span.newfolder {
	visibility: hidden;
}
.GetDirectoryContent .folders span.newfolder.active {
	visibility: visible;
}
.GetDirectoryContent .folders span.newfolder input {
    width: 100px;
}

.GetDirectoryContent .body {
    height: calc(100% - 60px);
}
.GetDirectoryContent .table {
    height: calc(100% - 74px);
    overflow-y: scroll;
}
.GetDirectoryContent table {
	border-collapse: collapse;
    width: 100%;
}
.GetDirectoryContent tbody tr {
	border: 1px solid #dddddd;
	border-left: unset;
}
.GetDirectoryContent thead button {
	background: transparent;
}
.GetDirectoryContent thead {
    background: url(/img/gradHeader.png) repeat-x scroll 0 -30px transparent;
}
.GetDirectoryContent .table tbody td.folder {
    background-image: url(/img/folder.png);
	    background-repeat: no-repeat;
		background-position-y: center;
margin: 6px 0 0 4px;
    width: 13px;
    height: 13px;
	    padding-left: 20px;
}
.GetDirectoryContent .filter input {
    width: 200px;
}
.GetDirectoryContent table td.col_0 {
    width: 24px;
}
.GetDirectoryContent table td.col_1 {
    min-width: 300px;
}
.GetDirectoryContent table td.col_2 {
    width: 78px;
}
.GetDirectoryContent table td.col_3 {
    width: 120px;
}
.GetDirectoryContent table td.col_4 {
    width: 190px;
}
.GetDirectoryContent .table tbody td.col_0 {
	text-align: center;
}
.GetDirectoryContent .table tbody td .choose {
    background-image: url(/img/choose.png);
    margin: 2px 3px -3px 0px;
    width: 13px;
    height: 13px;
}
.GetDirectoryContent .foot input {
	width: 260px;
}
.GetDirectoryContent .foot :global(#zone) {
    width: calc(100% - 260px);
    background-color: #BDBDC0;
	height: 24px;
    /* height: 100%; */
    display: inline-block;
    right: 12px;
    position: absolute;
    text-align: right;
}
.GetDirectoryContent .foot .progressbar {
    background-color: #DDDDDD;
    position: absolute;
    height: 24px;
    right: 0;
}
.GetDirectoryContent .foot span.dropTitle {
    padding: 0px 26px;
    font-size: 24px;
    color: #e7dede;
    vertical-align: top;

}
.GetDirectoryContent .foot.active .progressbar {
    width: 0%;
}
.GetDirectoryContent .foot.active .dropTitle {
    display: none;
}

  .drop-zone {
/*    display: grid;
    align-items: center;
    margin: auto;
    width: 200px;
    height: 100px;
    background-color: #ff3e00;
    color: white;*/
  }
  .over {
    background-color: white;
    color: #ff3e00;
    border: #ff3e00 solid 2px;
  }
  .drop-zone p {
    text-align: center;
  }

</style>
