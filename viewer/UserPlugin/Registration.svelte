<script>
import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from '../Utils.js';

export let attr = {};

// export 
let indexes = {};
// export let layerID = data.layerID;


let {layerID, width = 670, height = 210} = attr;
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
	// map._Registration.$destroy();
	map._userReg.$destroy();
};
const login = () => {
console.log('login', layerID, attr);
};
const registration = async () => {
	let pars = Object.values(contNode.getElementsByTagName('input')).reduce((a, c) => {
		a[c.name] = c.value;
		return a;
	}, {});
	let arr = await Utils.postJson({cmd: 'RegistrationExt', pars, path: 'Handler', ext: '', host:'https://my.kosmosnimki.ru'});

console.log('registration', arr);
// https:// my.kosmosnimki.ru/Handler/RegistrationExt
	// const key = id + '_' + layerID;
	// map._Registration.$destroy();
	// map._Registration.$destroy();
};
// https: //my.kosmosnimki.ru/Account/Recover/sort
</script>

<Draggable {width}>

<div class="Registration" bind:this={contNode}>
	<div class="header"> 
		<span class="title">Регистрация</span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body">
		<div class="loginMain">
			<div>
				<span class="loginLabel">Заполните поля формы</span>
			</div>
			<div class="line">
				<span class="col_1">
					<span class="loginLabel">Фамилия</span>
					<input name="firstName" class="RegFirstName" type="text" placeholder="Фамилия" />
				</span>
				<span class="col_2">
					<span class="loginLabel">Имя</span>
					<input name="lastName" class="RegLastName" type="text" placeholder="Имя" />
				</span>
			</div>
			<div class="line full">
				<span class="email">Электронная почта</span>
				<input name="email" class="RegEmail" type="text" placeholder="" />
			</div>
			<div>
				<span class="col_1">
					<span class="loginLabel">Пароль</span>
					<input name="password" type="password" class="NewPassword" />
				</span>
				<span class="col_2">
					<span class="loginLabel">Повтор пароля</span>
					<input name="repeat" type="password" class="Repeat" />
				</span>
			</div>
			<div>
				<span class="col_1">
					<span class="loginLabel">Псевдоним</span>
					<input name="login" class="RegFirstName" type="text" placeholder="Псевдоним" />
				</span>
				<span class="col_2">
					<span class="loginLabel">Введите число</span>
					<input name="captcha" class="RegLastName" type="text" placeholder="" />
					<img src="https://my.kosmosnimki.ru/Account/Captcha?r={Math.round(Math.random() * Math.pow(10, 9))}" alt="" />
				</span>
			</div>
		</div>
		<div class="loginLinks">
			<button on:click={registration}>Зарегистрироваться</button>
		</div>
		 <div class="policy">
				<span>
			 Нажимая на кнопку, вы соглашаетесь с <a target="blank" href="//my.kosmosnimki.ru/Docs/Политика конфиденциальности.pdf">политикой конфиденциальности</a>
			 и <a target="blank" href="//my.kosmosnimki.ru/Docs/Политика оператора в отношении обработки и защиты персональных данных.pdf">
			 политикой оператора</a> в отношении обработки и защиты персональных данных
				</span>
		 </div>
	</div>
</div>
</Draggable>

<style>
.Registration {
    background-color: #FFFFFF;
/*
	width: calc(100% - 8px);
    height: calc(100% - 8px);
*/
    padding: 4px;
    font-size: 12px;
}
.Registration .header {
    font-weight: bold;
}
.Registration .title {
	pointer-events: none;
}
.Registration .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}
.Registration .body .col_1,
.Registration .body .col_2 {
    width: 50%;
	    display: inline-block;
		position: relative;
}
.Registration .body .policy span {
       width: 80%;
    display: inline-block;
    border: 1px dotted;
	    white-space: normal;
}
.Registration .body .policy {
    text-align: center;
}
.Registration .body input {
	display: inline-block;
    position: absolute;
    right: 8px;
}
.Registration .body input.RegEmail {
    right: 13px;
    /* left: 129px; */
    width: calc(100% - 174px);
}
/*
.Registration .body {
    height: 400px;
    overflow-y: auto;
}

.Registration .loginMain {
	text-align: center;
}
.Registration .loginMain button {
    border: 1px solid;
    margin-top: 8px;
}

.Registration table {
    width: 100%;
}
.Registration input {
}
*/
.Registration .loginLinks button {
	color: white;
    background-color: #787cbc;
    padding: 10px;
    margin: 10px;
}
.Registration .loginLinks,
.Registration .loginLinks {
    
    text-align: center;

}

</style>
