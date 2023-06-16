<script>
import DropFile from '@svelte-parts/drop-file'
import Draggable from '../Modal/Draggable.svelte';
import Utils from '../Utils.js';
import {_drivesInfo, _userInfo} from '../stores.js';

export let attr = {};

let {layerID, width = 800, height = 460} = attr;
let gmxMap = L.gmx.gmxMap,
	map = gmxMap.leafletMap,
	layersByID = gmxMap.layersByID,
	properties = layersByID[layerID]?._gmx.properties;

let props = {},	drives,
	folder = '', folderMap,
	folderCont = [],
	userInfo, files, foot,
	fileOver = false,
	progressbar,
	pathCount = 0;

let closeIcon = L.gmxUtil.setSVGIcon('close');

const onDrop = (arr) => {
	fileOver = false
	files = arr;
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
	let arr = await Utils.getJson({cmd: 'GetDirectoryContent', path: 'FileBrowser', pars:{root: folder}});
	if (Array.isArray(arr)) {
		pathCount = folder.split('/').filter(it => it).length - 1;
		folderCont = sortFolderCont(arr.map(it => {
			it.date = new Date(it.Date * 1000).toLocaleString();
			if (it.Size) it.size = Utils.formatBytes(it.Size);
			it.name = it.Name.match(/([^\.]+)/)[0];
			it.type = it.Name.match(/\.([^.]+)$|$/)[1] || '';
			it.zip = it.type === 'zip';
			it.choose = it.type === 'geojson' || it.type === 'shp' || it.type === 'tab';
			return it;
		}));
	}
};

_userInfo.subscribe(value => {
	if (value.Folder) {
		folderMap = value.Folder + '/Maps/' + L.gmx.gmxMap.properties.title + '/';
		userInfo = value;
		getFolder(folderMap);
	}
});
_drivesInfo.subscribe(value => drives = value);

let sortAttr = { key: 'Name', desc: false };
const sortFolderCont = (arr) => {
	const desc = sortAttr.desc ? 1 : -1;
	const key = sortAttr.key;
	return arr.sort((a, b) => {
		let aa = a[key] || '', bb = b[key] || '';
		let nn = aa.localeCompare && bb.localeCompare ? aa.localeCompare(bb) : aa - bb;
		return (+b.Directory) - (+a.Directory) || (desc * nn);
	});
};

const sortBy = (k) => {
	if (sortAttr.key === k) sortAttr.desc = !sortAttr.desc;
	sortAttr.key = k;
	folderCont = sortFolderCont(folderCont); 
};

let newFolderShow;
const addFolder = async (ev) => {
	let name = ev.target.previousElementSibling.value;
	if (name && await Utils.getJson({cmd: 'CreateFolder', path: 'FileBrowser', pars:{FullName: folder + name}})) getFolder(folder);
};
const goParent = () => {
	let name = folder.replace(/([^\/]+\/)$/, '');
	if (name) getFolder(name);
};

const cmdContextMenu = async (cmd, data) => {
	await Utils.getJson({cmd, path: 'FileBrowser', pars:{FullName: folder + data.it.Name}});
	getFolder(folder);
};
const Download = (cmd, data) => {
	Utils.fileDownload(cmd, folder, data.it.Name);
};
const onRightClick = (it, e) => {
	let items = [
		{text: 'Удалить', cmd: 'Delete', fn: cmdContextMenu},
	];
	if (it.Directory) {
		items.push({text: 'Очистить', cmd: 'CleanFolder', fn: cmdContextMenu});
	} else {
		items.unshift({text: 'Скачать', cmd: 'Download', fn: Download});
		if (it.zip) items.push({text: 'Извлечь', cmd: 'Unzip', fn: cmdContextMenu});
	}
	if (!it.zip) items.push({text: 'Упаковать', cmd: 'Zip', fn: cmdContextMenu});
	gmxMap.leafletMap._showContextMenu({
		it,
		items,
		x: e.clientX, y: e.clientY
	});
}
const getSourceColumns = async it => {
	let arr = await Utils.getJson({cmd: 'GetSourceColumns', pars:{SourceName: folder + it.Name}});
	attr.onSourceColumns(arr, it.name, {Path: folder + it.Name, Exists: true});
};

// {@debug	drives}

</script>

<Draggable {width} {height}>

<div class="FileBrowser">
	<div class="header">
		<span class="title">{layerID ? 'Файл: ' : 'Создать векторный слой'}<b>{props.Title || ''}</b></span>
		<button on:click={() => map._fileBrowser.$destroy()} type="button" class="close">{@html closeIcon}</button>
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
			{@const clickMe = e => getFolder(folder + it.Name + '/')}
			{@const menu = e => onRightClick(it, e)}
				<tr on:contextmenu|stopPropagation|preventDefault={menu}>
					<td class="col_0">{#if it.choose}<button class="choose img" on:click={() => getSourceColumns(it)} />{/if}</td>
					<td class="col_1">
						{#if it.Directory}<button class="folder img" on:click={clickMe} />{/if}
						<button on:click|stopPropagation|preventDefault={menu}>{it.name}</button>
					</td>
					<td class="col_2">{it.type}</td>
					<td class="col_3">{it.Directory ? 'Папка' : it.size}</td>
					<td class="col_4">{it.date}</td>
				</tr>
			{/each}
			</tbody></table>
		</div>
	</div>

	<div bind:this={foot} class="foot">
		<input bind:files multiple type="file" />
		<DropFile onDrop={onDrop} onEnter={() => fileOver = true} onLeave={() => fileOver = false}>
			<div bind:this={progressbar} class="progressbar" />
			<span class="dropTitle {`drop-zone ${fileOver ? 'over' : ''}`}">
				{fileOver ? 'Отпустите кнопку' : 'Перетащите файлы сюда'}
			</span>
		</DropFile>
	</div>
</div>

</Draggable>

<style>
.FileBrowser {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.FileBrowser .header {
    font-weight: bold;
}
.FileBrowser .header .title {
	pointer-events: none;
}
.FileBrowser .header .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}

.FileBrowser .folders button {
    border: 1px solid;
    border-radius: 0;
    outline: none;
    margin: 0;
    padding: 0 6px;
    height: 20px;
    font-family: Tahoma, Arial, sans-serif;
}
.FileBrowser button.img {
    background-repeat: no-repeat;
    border: unset;
	outline: none;
    border-radius: unset;
	padding: 0;
    width: 15px;
    height: 15px;
    top: 2px;
    position: relative;
    margin-left: 6px;
    background-size: contain;

}
.FileBrowser button.reload {
    background-image: url(/img/reload.png);
}

.FileBrowser button.home {
    background-image: url(/img/home.png);
}

.FileBrowser button.newfolder {
    background-image: url(/img/newfolder.png);
}
.FileBrowser .folders span.newfolder {
	visibility: hidden;
}
.FileBrowser .folders span.newfolder.active {
	visibility: visible;
}
.FileBrowser .folders span.newfolder input {
    width: 100px;
}

.FileBrowser .body {
    height: calc(100% - 60px);
}
.FileBrowser .table {
    height: calc(100% - 74px);
    overflow-y: scroll;
}
.FileBrowser table {
	border-collapse: collapse;
    width: 100%;
}
.FileBrowser tbody tr {
	border: 1px solid #dddddd;
	border-left: unset;
}
.FileBrowser thead button {
	background: transparent;
}
.FileBrowser thead {
    background: url(/img/gradHeader.png) repeat-x scroll 0 -30px transparent;
}
.FileBrowser .table tbody button.folder {
    background-image: url(/img/folder.png);
	background-repeat: no-repeat;
	background-position-y: center;
	margin: 6px 0 0 4px;
    width: 13px;
    height: 13px;
	padding-left: 20px;
}
.FileBrowser .filter input {
    width: 200px;
}
.FileBrowser table td.col_0 { width: 24px; }
.FileBrowser table td.col_1 { min-width: 300px; }
.FileBrowser table td.col_2 { width: 78px; }
.FileBrowser table td.col_3 { width: 120px; }
.FileBrowser table td.col_4 { width: 190px; }
.FileBrowser .table tbody td.col_0 {
	text-align: center;
}
.FileBrowser .table tbody td .choose {
    background-image: url(/img/choose.png);
    margin: 2px 3px -3px 0px;
    width: 13px;
    height: 13px;
}
.FileBrowser .foot input {
	width: 260px;
}
.FileBrowser .foot :global(#zone) {
    width: calc(100% - 260px);
    background-color: #BDBDC0;
	height: 24px;
    display: inline-block;
    right: 12px;
    position: absolute;
    text-align: right;
}
.FileBrowser .foot :global(#zone input) {
    width: calc(100% - 240px);
    right: 22px;
    position: relative;
}
.FileBrowser .foot .progressbar {
    background-color: #DDDDDD;
    position: absolute;
    height: 24px;
    right: 0;
}
.FileBrowser .foot span.dropTitle {
    width: 100%;
    font-size: 24px;
    color: #e7dede;
    vertical-align: top;
	text-align: center;
    display: inline-block;
}
.FileBrowser .foot.active .progressbar {
    width: 0%;
}
.FileBrowser .foot.active .dropTitle {
    display: none;
}

.FileBrowser .over {
    background-color: white;
    color: #ff3e00;
    border: #ff3e00 solid 2px;
  }

</style>
