<script>
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from '../Utils.js';

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

const getItem = async layerID => {
	drives = await Utils.getDrives();
	props = await Utils.getDirectoryContent(layerID);
	// SourceType = props.SourceType || 'Файл';
	// GeometryType = props.GeometryType || 'linestring';
	// IsRasterCatalog = props.IsRasterCatalog;
	// TemporalLayer = props.TemporalLayer;
	// if (props.Quicklook) {
		// Quicklook = JSON.parse(props.Quicklook);
		// isQuicklook = true;
	// }
	// colsArr = props.Columns.filter(it => !it.IsPrimary && it.name !== 'GMX_RasterCatalogID' && it.name !== 'wkb_geometry');


console.log('getItem', props, drives);
	// fields = res.fields;
	// indexes = res.indexes;
	// data = res.values[0];
	// geoJSON = L.gmxUtil.geometryToGeoJSON(data[indexes.geomixergeojson], true, true);
};
layerID && getItem(layerID);

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
const selGeometryType = (ev) => {
	const tabNode = ev.target;
	GeometryType = tabNode.className;
console.log('del', GeometryType);
};
const delCol = (ev) => {
	// const tabNode = ev.target;
	// GeometryType = tabNode.className;
console.log('delCol', GeometryType);
};

console.log('attributes', layerID, attr);

</script>

<Draggable {width} {height}>


<div class="EditLayer">
	
	<div class="header">
		<span class="title">{layerID ? 'Файл: ' : 'Создать векторный слой'}<b>{props.Title || ''}</b></span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body">
	<div class="line folders">
		{#each (drives || []) as it}
		<button>{it}</button>
		{/each}
		<button title="Обновить" class="reload img" />
		<button title="Директория проекта" class="home img" />
		<button title="Новая папка" class="newfolder img" />

<img src="img/reload.png" title="Обновить" style="cursor: pointer; border: none; margin: 0px 5px 0px 10px; width: 14px; height: 15px;">
<img src="img/home.png" title="Директория проекта" style="cursor: pointer; border: none; margin: 0px 10px 0px 5px; width: 15px; height: 15px;">
<img src="img/newfolder.png" title="Новая папка" style="cursor: pointer; border: none; width: 16px; height: 13px; margin-right: 10px;">
	</div>
	</div>

<!--  input class="btn" type="submit" value="y:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="w:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="x:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="z:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="t:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="q:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="r:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="p:\" style="padding: 0px 5px;"></td>
<td valign="top">

<img src="img/reload.png" title="Обновить" style="cursor: pointer; border: none; margin: 0px 5px 0px 10px; width: 14px; height: 15px;"></td><td valign="top">
<img src="img/home.png" title="Директория проекта" style="cursor: pointer; border: none; margin: 0px 10px 0px 5px; width: 15px; height: 15px;"></td><td valign="top" style="height: 20px;"><table><tbody><tr><td valign="top">
<img src="img/newfolder.png" title="Новая папка" style="cursor: pointer; border: none; width: 16px; height: 13px; margin-right: 10px;"></td><td>
<input class="inputStyle" style="width: 150px; margin: 0px 3px; display: none;"></td><td>
<input class="btn" type="submit" value="Создать" style="padding: 0px 5px; display: none;"></td></tr></tbody></table></td></tr></tbody></table></div>

		<label>Мин. зум<input type="text" value={props.RCMinZoomForRasters || ''} class="minzoom" /></label>
	</div>


<div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-draggable ui-resizable" tabindex="-1" role="dialog" aria-describedby="ui-id-142" aria-labelledby="ui-id-143" style="position: absolute; height: auto; width: 800px; top: 179px; left: 87px; display: block;">

<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">

<span id="ui-id-143" class="ui-dialog-title">Файл</span>
<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="">
<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
<span class="ui-button-text"></span></button></div>

<div id="ui-id-142" class="ui-dialog-content ui-widget-content" style="width: auto; min-height: 0px; max-height: none; height: 349px;">

<div id="fileBrowserDialog">

<div style="height: 24px;"><table><tbody><tr><td>

<input class="btn" type="submit" value="workfolder\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="y:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="w:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="x:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="z:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="t:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="q:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="r:\" style="padding: 0px 5px;"></td><td>
<input class="btn" type="submit" value="p:\" style="padding: 0px 5px;"></td>
<td valign="top">
<img src="img/reload.png" title="Обновить" style="cursor: pointer; border: none; margin: 0px 5px 0px 10px; width: 14px; height: 15px;"></td><td valign="top">
<img src="img/home.png" title="Директория проекта" style="cursor: pointer; border: none; margin: 0px 10px 0px 5px; width: 15px; height: 15px;"></td><td valign="top" style="height: 20px;"><table><tbody><tr><td valign="top">
<img src="img/newfolder.png" title="Новая папка" style="cursor: pointer; border: none; width: 16px; height: 13px; margin-right: 10px;"></td><td>
<input class="inputStyle" style="width: 150px; margin: 0px 3px; display: none;"></td><td>
<input class="btn" type="submit" value="Создать" style="padding: 0px 5px; display: none;"></td></tr></tbody></table></td></tr></tbody></table></div>

<div class="fileCanvas">

<div class="currentDir" style="color: rgb(21, 48, 105); font-size: 12px;">
<span class="fileBrowser-pathWidget">
<span class="fileBrowser-pathElem">@SergikOriginal\</span>
<span class="fileBrowser-pathElem">Maps\</span>
<span class="fileBrowser-pathElem">sergt_oper\</span></span><br>Фильтр
<input class="inputStyle" style="width: 200px;">

<div class="fileBrowser-progress" style="display: none;"></div></div>

<div style="overflow-y: scroll; height: 235px;"><table style="width: 100%;"><thead><tr><td style="width: 20px;">
<input class="btn" type="submit" value="\" style="padding: 0px 5px;"></td><td style="text-align: left;">
<span class="buttonLink">Имя</span></td><td style="width: 10%; text-align: center;">
<span class="buttonLink">Тип</span></td><td style="width: 15%; text-align: center;">
<span class="buttonLink">Размер</span></td><td style="width: 25%; text-align: center;">
<span class="buttonLink">Дата</span></td></tr></thead><tbody><tr class=""><td></td><td>[..]</td><td></td><td></td><td></td></tr><tr class=""><td></td><td>

<div class="fileCanvas-folder-icon"></div>

<div style="display: inline-block; position: relative;">
<span style="font-size: 12px;">test1</span></div></td><td></td><td class="invisible" style="text-align: center;">Папка</td><td class="invisible" style="text-align: center;">18.12.2018 10:18:50</td></tr><tr class=""><td></td><td>

<div style="display: inline-block; position: relative;">
<span style="font-size: 12px;">test1</span></div></td><td style="text-align: right; font-size: 12px;">zip</td><td size="4414" class="invisible" style="text-align: right;">4.31 Кб</td><td class="invisible" style="text-align: center;">18.12.2017 12:43:50</td></tr></tbody></table></div></div>
<div class="fileUpload">
<div class="fileBrowser-progressBar ui-progressbar ui-widget ui-widget-content ui-corner-all" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" style="display: none;">
<div class="ui-progressbar-value ui-widget-header ui-corner-left ui-corner-right" style="display: block; width: 100%;"></div></div>
<div style="height: 30px;">
<div class="fileBrowser-dragFileMessage">Перетащите файлы сюда</div><table><tbody><tr><td style="padding-top: 18px;"><form enctype="multipart/form-data" method="post" action="https://maps.kosmosnimki.ru/FileBrowser/Upload.ashx?WrapStyle=message" target="fileBrowserUpload_iframe">
<input type="file" name="rawdata" multiple="multiple" style="width: 200px;"></form></td></tr></tbody></table></div></div></div></div>
<div class="ui-resizable-handle ui-resizable-n" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-w" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-se" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-sw" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-ne" style="z-index: 90;"></div>
<div class="ui-resizable-handle ui-resizable-nw" style="z-index: 90;"></div></div -->

</div>

</Draggable>

<style>
.EditLayer {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.EditLayer .header {
    font-weight: bold;
}
.EditLayer .header .title {
	pointer-events: none;
}
.EditLayer .header .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}

.EditLayer .folders button {
	border: none;
	    outline: none;
	margin: 0;
    padding: 6px;
}
.EditLayer button.img {
    background-repeat: no-repeat;
    display: inline-block;
	    border: unset;
		border-radius: unset;
    padding: 0;
    margin-left: 4px;
        width: 20px;
    height: 20px;
}

.EditLayer button.reload {
    background-image: url(/img/reload.png);
}

.EditLayer button.home {
    background-image: url(/img/home.png);
}

.EditLayer button.newfolder {
    background-image: url(/img/newfolder.png);
}


.EditLayer .tabs.main .tab.main form label {
    display: block;
	line-height: 18px;
}
.EditLayer .tabs.main .tab.main form label input {
    width: unset;
}
.EditLayer .tabs.main .tab.main td.val{
    width: 274px;
}
.EditLayer .tabs.main,
.EditLayer .tabs.dop,
.EditLayer .tabs.meta,
.EditLayer .tabs.cols {
    height: calc(100% - 20px);
}
.EditLayer .tabs.main .tab.main,
.EditLayer .tabs.dop .tab.dop,
.EditLayer .tabs.meta .tab.meta,
.EditLayer .tabs.cols .tab.cols {
    height: calc(100% - 60px);
    overflow-y: auto;
}
.EditLayer .tabs.dop .tab.dop,
.EditLayer .tabs.meta .tab.meta,
.EditLayer .tabs.cols .tab.cols,
.EditLayer .tabs.main .tab.main {
    display: block;
}
.EditLayer .tabs.meta .tab.meta td.val input {
	max-width: max-content;
}

.EditLayer .tabs.dop li.dop,
.EditLayer .tabs.meta li.meta,
.EditLayer .tabs.cols li.cols,
.EditLayer .tabs.main li.main {
	border-bottom: 4px solid #6f9ed2;
}
.EditLayer .tabs ul li {
	padding: 0;
	cursor: pointer;
}
.EditLayer .tabs ul li:hover {
	color: blue;
}
.EditLayer .tabs ul li button {
	border: none;
	    outline: none;
	margin: 0;
    padding: 6px;
}
.EditLayer .tabs ul {
	display: flex;
    list-style: none;
	margin: 0;
    padding: 0;
}
.EditLayer .tabs .tab {
    display: none;
}

.EditLayer button.geom {
    background-image: url(/img/choose2.png);
	padding: 0;
    width: 16px;
    height: 12px;
    margin-left: 4px;
}
.EditLayer .manual button {
    width: 24px;
    height: 24px;
    display: inline-block;
    margin: 0;
	padding: 0;
    border: unset;
	border-radius: unset;

    outline: none;
    cursor: pointer;
    background-image: url(/img/manual_types.png);
}
.EditLayer .manual.polygon button.polygon {
    background-position: -120px 0px;
}
.EditLayer .manual button.polygon {
    background-position: -96px 0px;
}
.EditLayer .manual.linestring button.linestring {
    background-position: -72px 0px;
}
.EditLayer .manual button.linestring {
    background-position: -48px 0px;
}
.EditLayer .manual.point button.point {
    background-position: -24px 0px;
}
.EditLayer .manual button.point {
    background-position: -0px 0px;
}
.EditLayer table {
    width: 100%;
}

.EditLayer textarea,
.EditLayer input[type=text] {
    width: calc(100% - 16px);
	font-size: 1em;
    font-family: Tahoma, Arial, sans-serif;
}
.EditLayer input[type=text].short {
    width: calc(100% - 36px);
}
.EditLayer input[type=text].shablon {
    width: 220px;
}
.EditLayer input[type=text].minzoom {
    width: 22px;
}
.EditLayer .tabs.dop .tab.dop .TemporalLayer .maxshow {
	    margin: 0 6px;
    width: 22px;
    text-align: center;
}

</style>
