<script>
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import FileBrowser from './FileBrowser.svelte';
import Utils from '../Utils.js';

export let attr = {};

// export let data = [];
// export let indexes = {};
// export let layerID;

let {layerID, width, height = 460} = attr;
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

let load = true;
const getItem = async layerID => {
	props = await Utils.getJson({cmd: 'GetLayerInfo', path: 'Layer', pars:{LayerName: layerID}});
	load = false;
	SourceType = props.SourceType || 'Файл';
	GeometryType = props.GeometryType || 'linestring';
	IsRasterCatalog = props.IsRasterCatalog;
	TemporalLayer = props.TemporalLayer;
	if (props.Quicklook) {
		Quicklook = JSON.parse(props.Quicklook);
		isQuicklook = true;
	}
	colsArr = (props.Columns || []).filter(it => !it.IsPrimary && it.name !== 'GMX_RasterCatalogID' && it.name !== 'wkb_geometry');


console.log('getItem', props, properties);
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
const getEncodeSourceOption = (f) => {
	return [
		'windows-1251',
		'utf-8',
		'koi8-r',
		'utf-7',
		'iso-8859-5',
		'koi8-u',
		'cp866'
	].map(n => {
		// const n = it.Name;
		return '<option value="' + n + '" ' + (f === n ? 'selected' : '') + '>' + n + '</option>';
	});
};

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	map._destroyEditLayer(layerID);
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
const setDirectory = (pt) => {
// console.log('setGeo', pt);
	map._fileBrowser = new FileBrowser({
		target: document.body,
		props: {
			attr: {
				layerID,
				onSourceColumns: (it) => {
					// geoJSON = it.toGeoJSON().geometry;
					// map._fileBrowser.$destroy();
	console.log('onSourceColumns', it);
				},
				left: 200,
				top: 200
			}
		}
	});
};

console.log('attributes', layerID, attr);

</script>

<Draggable {width} {height}>

<div class="EditLayer">
{#if load}
	<div class="load">
		<span class="title">Загрузка...</span>
	</div>
{:else}
	<div class="header">
		<span class="title">{layerID ? 'Слой: ' : 'Создать векторный слой'}<b>{props.Title || ''}</b></span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	 <div class="tabs {tab}">
		<ul>
			<li class="main"><button on:click={selTab}>Общие</button></li>
			<li class="cols"><button on:click={selTab}>Колонки</button></li>
			<li class="meta"><button on:click={selTab}>Метаданные</button></li>
			<li class="dop"><button on:click={selTab}>Дополнительно</button></li>
		</ul>
	
		<div class="main tab">
			<table class="propertiesTable">
			<tbody>
				<tr>
					<td class="title">
						<span>Имя</span>
					</td>
					<td class="val">
						<input type="text" data-key='Title' value={props.Title || ''} />
					</td>
				</tr>
				<tr>
					<td class="title">
						<span>Копирайт</span>
					</td>
					<td class="val">
						<input type="text" data-key='Copyright' value={props.Copyright || ''} />
					</td>
				</tr>
				<tr>
					<td class="title">
						<span>Описание</span>
					</td>
					<td class="val">
						<textarea type="text" data-key='Description' value={props.Description || ''} />
					</td>
				</tr>
				{#if layerID}
					<tr>
						<td class="title">
							<span>Геометрия</span>
						</td>
						<td class="val">
							<input type="text" disabled data-key='GeometryType' value={props.GeometryType || ''} />
						</td>
					</tr>
					<tr>
						{#if SourceType === 'file'}
						<td class="title">
							<span>Источник:<br> Файл</span>
						</td>
						<td class="val">
							<input type="text" value={props.ShapePath?.Path || ''} class="ShapePath short {props.ShapePath?.Exists ? 'Exists' : ''}" /><button on:click={setDirectory} class="img geom" />
							<div class="manual">
								<span>Кодировка</span>
								<select class="EncodeSource">
									{@html getEncodeSourceOption(props.EncodeSource)}
								</select>
							</div>
							<div class="otherEncoding">
								<label><input type="checkbox" /> Другая</label>
								<input class="VectorLayerEncodingInput" disabled="disabled" />
							</div>
						</td>
						{:else if SourceType === 'table'}
						<td class="title">
							<span>Источник:<br> Таблица</span>
						</td>
						<td class="val">
							<input type="text" value={props.TableName || ''} class="TableName short" /><button on:click={setGeo} class="img geom" />
							<div class="manual">
								<span>Проекция</span>
								<select class="selectEPSG">
									<option value="EPSG:4326" selected={props.TableCS === 'EPSG:4326'}>Широта/Долгота (EPSG:4326)</option>
									<option value="EPSG:3395" selected={props.TableCS === 'EPSG:3395'}>Меркатор (EPSG:3395)</option>
								</select>
							</div>
						</td>
						{:else if SourceType === 'manual'}
						<td class="title">
							<span>Геометрия:</span>
						</td>
						<td class="val">
							<span class="manual {GeometryType}">
								<button on:click={selGeometryType} class="polygon" title="полигоны"></button>
								<button on:click={selGeometryType} class="linestring" title="линии"></button>
								<button on:click={selGeometryType} class="point" title="точки"></button>
							</span>
						</td>
						{/if}
					</tr>
				{:else}
				<tr>
					<td class="title">
						<form>
							<label><input type="radio" bind:group={SourceType} value="file">Файл</label>
							<label><input type="radio" bind:group={SourceType} value="Таблица">Таблица</label>
							<label><input type="radio" bind:group={SourceType} value="manual">Вручную</label>
						</form>
					</td>
					<td class="val">
						{#if SourceType === 'file'}
							<input type="text" value="" class="ShapePath short" /><button on:click={setGeo} class="img geom" />
						{:else if SourceType === 'table'}
							<input type="text" value="" class="TableName short" /><button on:click={setGeo} class="img geom" />
							<div class="manual">
								<span>Проекция</span>
								<select class="selectEPSG">
									<option value="EPSG:4326">Широта/Долгота (EPSG:4326)</option>
									<option value="EPSG:3395">Меркатор (EPSG:3395)</option>
								</select>
							</div>
						{:else if SourceType === 'manual'}
							<span class="jj">Геометрия: </span>
							<span class="manual {GeometryType}">
								<button on:click={selGeometryType} class="polygon" title="полигоны"></button>
								<button on:click={selGeometryType} class="linestring" title="линии"></button>
								<button on:click={selGeometryType} class="point" title="точки"></button>
							</span>
						{/if}
					</td>
				</tr>
				{/if}
			</tbody>
			</table>
		</div>

		<div class="cols tab scrollbar">
			<table class="propertiesTable">
			<thead>
				<tr><th>Название</th><th>Тип</th></tr>
			</thead>
			<tbody>
				{#each (props.Columns || []) as it, i}
				{@const name = it.Name}
				{@const type = it.ColumnSimpleType}
				{@const flag = !it.IsPrimary && name !== 'GMX_RasterCatalogID' && name !== 'wkb_geometry'}
				{#if flag}
				<tr>
					<td class="title">
						<input type="text" data-key={name} value={name || ''} />
					</td>
					<td class="val">
						<select class="typesselect">
							<option value="float" class="float" selected={type === 'float'}>Float</option>
							<option value="integer" class="integer" selected={type === 'integer'}>Integer</option>
							<option value="string" class="string" selected={type === 'string'}>String</option>
							<option value="time" class="time" selected={type === 'time'}>Time</option>
							<option value="date" class="date" selected={type === 'date'}>Date</option>
							<option value="datetime" class="datetime" selected={type === 'datetime'}>DateTime</option>
							<option value="boolean" class="boolean" selected={type === 'boolean'}>Boolean</option>
						</select>
						<button on:click={delCol} class="img del" />
					</td>
				</tr>
				{/if}
				{/each}
				<tr class="newRaw">
					<td class="title">
						<input type="text" value={''} />
					</td>
					<td class="val">
					</td>
				</tr>
			</tbody>
			</table>
		</div>


		<div class="meta tab scrollbar">
			<table class="propertiesTable">
			<thead>
				<tr><th>Параметр</th><th>Значение</th></tr>
			</thead>
			<tbody>
				{#each Object.keys(props.MetaProperties || {}) as k}
				{@const it = props.MetaProperties[k]}
				<tr>
					<td class="title">
						<input type="text" data-key='title' value={k || ''} />
					</td>
					<td class="val">
						<input type="text" data-key='val' value={it.Value || ''} />
						<button on:click={delCol} class="img del" />
					</td>
				</tr>
				{/each}
				<tr>
					<td class="title">
						<input type="text" data-key='title' value={''} />
					</td>
					<td class="val">
						<input type="text" data-key='val' value={''} />
						<button on:click={delCol} class="img del" />
					</td>
				</tr>
			</tbody>
			</table>
		</div>

		<div class="dop tab scrollbar">
			<div class="TemporalLayer">
				<fieldset class="TemporalLayer">
					<legend>
						<label><input type="checkbox" bind:checked={TemporalLayer} />Разбить по датам</label>
					</legend>
					<div class="line">
						<span>На экране не более</span><input class="maxshow" /> <span>дней</span>
					</div>
					<div class="line">
						<span>Колонка даты</span>
						<select class="columnSelect">
							{#each (props.Columns || []).filter(it => it.ColumnSimpleType === 'date' || it.ColumnSimpleType === 'datetime') as it}
							{@const name = it.Name}
								<option value={name} selected={name === props.TemporalColumnName}>{name}</option>
							{/each}
						</select>
					</div>
					<details bind:open={isOpenMaxPeriod}>
						<summary>Дополнительно</summary>
						<div class="line">
							<span>Тайлы по дням до</span>
							<select class="maxPeriod">
							{#each (TemporalPeriods || []) as it, i}
							{@const name = it.Name}
								<option value={it} selected={i === TemporalPeriods.length - 1}>{it}</option>
							{/each}
							</select>
						</div>
					</details>
				</fieldset>
				<fieldset class="TemporalLayer">
					<legend>
						<label><input type="checkbox" bind:checked={IsRasterCatalog} />Каталог растров</label>
					</legend>
					<div class="line">
						<label>Мин. зум<input type="text" value={props.RCMinZoomForRasters || ''} class="minzoom" /></label>
					</div>
					<details bind:open={isOpenShablon}>
						<summary>Дополнительно</summary>
						<div class="line">
							<label>Шаблон имени<input type="text" value={props.Shablon || ''} class="shablon" /></label>
						</div>
						<div class="line">
							<label>Шаблон тайлов<input type="text" value={props.Shablon || ''} class="shablon" /></label>
						</div>
						<div class="line">
							<table class="propertiesTable">
							<thead>
								<tr><th>Параметр слоя</th><th>Атрибут объекта</th><th></th></tr>
							</thead>
							<tbody>
								{#each Object.keys(props.MetaProperties || {}) as k}
								{@const it = props.MetaProperties[k]}
								<tr>
									<td class="title">
										<input type="text" data-key='title' value={k || ''} />
									</td>
									<td class="val">
										<input type="text" data-key='title' value={it.Value || ''} />
									</td>
									<td class="op">
										<button on:click={delCol} class="img del" />
									</td>
								</tr>
								{/each}
								<tr>
									<td class="title">
										<input type="text" data-key='title' />
									</td>
									<td class="val">
										<input type="text" data-key='title' />
									</td>
									<td class="op">
										<button on:click={delCol} class="img del" />
									</td>
								</tr>
							</tbody>
							</table>
						</div>
					</details>
					<details bind:open={isQuicklook} class="quicklook">
						<summary>Накладываемое изображение</summary>
						<div class="line">
							<label>Мин. зум<input type="text" value={Quicklook?.minZoom || ''} class="minzoom" /></label>
						</div>
						<button class="link">Атрибут</button><br />
						<textarea class="template">{Quicklook?.template || ''}</textarea>
						<div class="link">Атрибуты привязки</div>
						<div class="line">
							{#if Quicklook}
							<table class="lqw"><tbody>
								{#each [1, 2, 3, 4] as i}
								{@const x = 'X' + i}
								{@const y = 'Y' + i}
								{@const xo = getColumnsOption(Quicklook[x] || x)}
								{@const yo = getColumnsOption(Quicklook[y] || y)}
								<tr>
									<td class="error">{x}<select data-name="{x}" class="point">{@html xo}</select></td>
									<td class="error">{y}<select data-name="{y}" class="point">{@html yo}</select></td>
								</tr>
								{/each}
							</tbody></table>
							{/if}
						</div>

					</details>
				</fieldset>
				<div class="line">
					<label>Шаблон названий объектов<br><input type="text" value={props.RCMinZoomForRasters || ''} class="shablon" /></label>
				</div>
				<label class="media"><input type="checkbox">Добавить описание</label>
				
			</div>
		</div>

		<div class="foot">
			<button on:click={save} class="save">{layerID ? 'Изменить' : 'Создать'}</button>
			{#if layerID}<button on:click={del} class="save">Удалить</button>{/if}
		</div>
	</div>
{/if}
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
.EditLayer .load {
	    text-align: center;
    font-size: x-large;
    /* color: red; */
}
.EditLayer .header {
    font-weight: bold;
}
.EditLayer .header .title {
	pointer-events: none;
	overflow: hidden;
    text-overflow: ellipsis;
    width: calc(100% - 16px);
    display: inline-block;
}
.EditLayer .header .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}
.EditLayer .tabs.main .tab.main form {
    min-width: 88px;
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
.EditLayer button.img {
    background-repeat: no-repeat;
    display: inline-block;
}
.EditLayer button.del {
    background-image: url(/img/recycle.png);
	    border: unset;
    padding: 0;
    margin-left: 4px;
    width: 10px;
    height: 12px;
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
	    border: 1px solid #AFC0D5;
    background-color: #FFFFFF;
    height: 14px;
    padding: 2px;
    margin: 1px 3px;
}
.EditLayer select {
	border: 1px solid #AFC0D5;
    background-color: #FFFFFF;
    height: 20px;
    margin: 1px 3px;
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
