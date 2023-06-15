<script>
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import Registration from './Registration.svelte';
import Utils from '../Utils.js';

export let attr = {};

// export 
let indexes = {};
// export let layerID = data.layerID;


let {layerID, width = 250, height = 210} = attr;
let fields = attr.indexes;
let data = [];
let contNode;
let closeIcon = L.gmxUtil.setSVGIcon('close');
let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
/*
let layersByID = gmxMap.layersByID;
let props = layersByID[layerID]._gmx.properties;
let attributes = props.attributes;
if (!fields) fields = attributes;
	let drawingList;


let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;

const getItem = async (layerID, id) => {
	let res = await Utils.search({
		geometry: true,
		layer: layerID,
		query: '[gmx_id]=' + id
	});
	fields = res.fields;
	indexes = res.indexes;
	data = res.values[0];
	geoJSON = L.gmxUtil.geometryToGeoJSON(data[indexes.geomixergeojson], true, true);
};
id && getItem(layerID, id);

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
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
const geoSummary = () => {
	return geoJSON ? L.gmxUtil.getGeoJSONSummary(geoJSON) : '';
}
let showModal = false;
const ok = (ev) => {
	showModal = false;
console.log('ok', ev);
};
let geoInput;
const editDescr = (ev) => {
	showModal = true;
	
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

console.log('attributes', layerID, attr);
*/
const closeMe = () => {
	// const key = id + '_' + layerID;
	// map._UserPlugin.$destroy();
	map._userPlugin.$destroy();
};
const login = () => {
console.log('login', layerID, attr);
};
const registration = () => {
console.log('registration', layerID, attr);
	if (map._userReg) map._userReg.$destroy();
	map._userReg = new Registration({
		target: document.body,
		props: {
			onSelect: (it) => {
				map._userReg.$destroy();
console.log('onSelect', geoJSON);
			},
			// width: 250, height: 210,
			// left: 200, top: 200
		}
	});
	// const key = id + '_' + layerID;
	// map._UserPlugin.$destroy();
	// map._userPlugin.$destroy();
};
// https: //my.kosmosnimki.ru/Account/Recover/sort
</script>

<Draggable {width} {height}>

<div class="UserPlugin" bind:this={contNode}>
	<div class="header"> 
		<span class="title">Пожалуйста, авторизуйтесь</span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body scrollbar">
		<div class="loginMain">
			<div>
				<span class="loginLabel">Логин</span><br>
				<input name="login" class="inputStyle inputLogin" placeholder="адрес электронной почты">
			</div>
			<div>
				<span class="loginLabel">Пароль</span><br>
				<input name="password" class="inputStyle inputPass" type="password" placeholder="пароль">
			</div>
			<button on:click={login}>Вход</button>
		</div>
		<div class="loginLinks">
			<button on:click={registration}>Регистрация</button>
			<a href="//my.kosmosnimki.ru/Account/Recover/sort" target="_blank">Восстановление пароля</a>
		</div>
	</div>
</div>

</Draggable>

<style>
.UserPlugin {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.UserPlugin .header {
    font-weight: bold;
}
.UserPlugin .title {
	pointer-events: none;
}
.UserPlugin .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}
.UserPlugin .body {
    height: 400px;
    overflow-y: auto;
}
.UserPlugin .loginMain {
	text-align: center;
}
.UserPlugin .loginMain button {
    border: 1px solid;
    margin-top: 8px;
}
.UserPlugin .loginLinks * {
    text-decoration: underline;
    color: unset;
	padding: 0;
    display: block;
    height: 14px;
}

.UserPlugin table {
    width: 100%;
}
.UserPlugin input {
    width: calc(100% - 16px);
}
</style>
