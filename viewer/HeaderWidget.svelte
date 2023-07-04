<script>
import {_userInfo} from './stores.js';
import Utils from './Utils.js';
import UserPlugin from './UserPlugin/UserPlugin.svelte';

// export let data;

const mapsPref = '//maps.kosmosnimki.ru/';
let gmxMap = L.gmx.gmxMap,
	map = gmxMap.leafletMap,
	userMapUrl,
	userInfo;

_userInfo.subscribe(value => {
	userInfo = value;
});

const save = (ev) => {
console.log('save', ev);
};

const cmdContextMenu = async (cmd, data) => {
console.log('cmdContextMenu', cmd, data);
	let input = '';
	switch (cmd) {
		case 'MapSaveAs':
			map._popupShow({
				width: 420, height: 100,
				inputs: [
					{name: 'mTitle', val: gmxMap.properties.title + ' (copy)'}
				],
				buttons: [{
					title: 'Сохранить',
					onClick: (arr) => {
						map._popupWindow.$destroy();
		console.log('onSelect', arr[0].value);
					},
				}],
				title: 'Сохранить карту как'
			});
			break;
		case 'MapLink':
			// let c = L.Projection.Mercator.project(map.getCenter());
			// gmxMap.options.position = {...c, z: 17 - map.getZoom()};
			let c = map.getCenter();
			gmxMap.options.position = {...c, z: map.getZoom()};
			let pars = {
				content: JSON.stringify({...gmxMap.options, ver: 2}),
				temp: false
			};
console.log('MapLink1', pars);
			let id = await Utils.getJson({cmd: 'Create', path: 'TinyReference', type: 'formData', pars});
			let val = Utils.prefix + 'api/index.html?permalink=' + id;
			map._popupShow({
				width: 420, height: 60,
				inputs: [
					{val, autofocus: true}
				],
				title: 'Ссылка на текущее состояние карты'
			});
			Utils.copyToClipboard(val);
			// let arr = await Utils.postJson({cmd: 'Create', path: 'TinyReference', type: 'formData', pars});
			let pl1 = await Utils.getJson({cmd: 'Get', path: 'TinyReference', pars: {id}});
console.log('MapLink', id, pars, pl1);
			break;
	}
};
const cmdUserInfo = async (cmd, data) => {
// console.log('', cmd, data);
	// await Utils.getJson({cmd, path: 'FileBrowser', pars:{FullName: folder + data.it.Name}});
	// getFolder(folder); Login
		const a = document.createElement("a");
	switch (cmd) {
		case 'userMap':
			if (userInfo) {
				a.href = mapsPref + 'api/index.html?%40' + userInfo.Login.replace('@', '%40');
				a.target =  '_blank'; a.click();
			}
			break;
		case 'admin':
			a.href = mapsPref + 'admin'; a.target =  '_blank'; a.click();
			break;
			
		case 'Logout':
			let arr = await Utils.getJson({cmd: 'Logout', path: '..', pars:{WithoutRedirection: 1}});
			return fetch('my.kosmosnimki.ru/Handler/Logout', {mode: 'cors', credentials: 'include'})
			.then(resp => resp.text())
			.then(json => {
				location.href = '/';
// console.log('Logout', json);
			});

			// arr = await Utils.getJson({cmd: 'Logout', path: 'Handler', ext: '', host:'my.kosmosnimki.ru'});
			// https://
			// my.kosmosnimki.ru/Handler/Logout?callback=gmx_unique_4&0.4928076100872849

			break;
	}
};
let menus = {
	mapMenu: [
		{text: 'Открыть', cmd: 'MapOpen', chkType: 'hidden'},
		{text: 'Создать', cmd: 'MapCreate', chkType: 'hidden', fn: cmdContextMenu},
		{text: 'Сохранить', cmd: 'MapSave', chkType: 'hidden', fn: cmdContextMenu},
		{text: 'Сохранить как', cmd: 'MapSaveAs', chkType: 'hidden', fn: cmdContextMenu},
		{text: 'Экспорт', cmd: 'MapExport', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Поделиться', cmd: 'MapLink', fn: cmdContextMenu},
		{text: 'Добавить закладку', cmd: 'MapLink2', chkType: 'hidden', fn: cmdContextMenu},
		{text: 'Печать', cmd: 'Print', fn: () => {map._print();}},
		{text: 'Свойства', cmd: 'MapProps', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Добавить группу', cmd: 'FolderAdd', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Права доступа', cmd: 'MapRights', chkType: 'disabled', fn: cmdContextMenu},
	],
	mapData: [
		{text: 'Открыть слой', cmd: 'LayerOpen', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Создать слой', cmd: 'LayerCreate', chkType: 'disabled', items: [
			{text: 'Растровый', cmd: 'EditLayer', chkType: 'disabled', st: 'Raster', fn: cmdContextMenu},
			{text: 'Векторный', cmd: 'EditLayer', chkType: 'disabled', st: 'Vector'},
			{text: 'Мультислой', cmd: 'EditLayer', chkType: 'disabled', st: 'MultiRaster', fn: cmdContextMenu},
			{text: 'Виртуальный', cmd: 'EditLayer', chkType: 'disabled', st: 'Virtual', fn: cmdContextMenu},
			{text: 'Каталог растров', cmd: 'EditLayer', chkType: 'disabled', st: 'CR', fn: cmdContextMenu},
			]},
		{text: 'Базовые слои', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Загрузить объекты', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Загрузить фотографии', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Подключить WFS/WMS', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Загрузить растры', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Каталоги растров', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
	],
	mapView: [
		{text: 'Дополнительные карты', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Закладки', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Объекты', cmd: 'Open', fn: cmdContextMenu},
	],
	mapInstr: [
		{text: 'Координатная сетка', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Индексная сетка', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Создание буферных зон', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Ручная привязка растров', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Краудсорсинг данных', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Пакетный геокодинг', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
		{text: 'Маршруты', cmd: 'Open', chkType: 'disabled', fn: cmdContextMenu},
	],
	mapService: [
		{text: 'Кадастр Росреестра', cmd: 'Open', fn: cmdContextMenu},
	],
	mapInfo: [
		{text: 'О проекте/Контакты', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Документация', cmd: 'Open', fn: cmdContextMenu},
		{text: 'GeoMixer API', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Использование плагинов', cmd: 'Open', fn: cmdContextMenu},
	],
	mapLinks: [
		{text: 'Карта пожаров', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Поиск снимков', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Веб-ГИС GeoMixer', cmd: 'Open', fn: cmdContextMenu},
	],
	setUser: [
		{text: 'Личный кабинет', cmd: 'ProfilePlugin', fn: cmdUserInfo},
		{text: 'Личная карта', cmd: 'userMap', fn: cmdUserInfo},
		{text: 'Системные настройки', cmd: 'admin', fn: cmdUserInfo},
		{text: 'Управление группами', cmd: 'UserGroupWidget', fn: cmdUserInfo},
		{text: 'Выйти', cmd: 'Logout', fn: cmdUserInfo},
	],
};

const userLogin = (pt) => {
console.log('userLogin', pt);
	if (map._userPlugin) map._userPlugin.$destroy();
	map._userPlugin = new UserPlugin({
		target: document.body,
		props: {
			onSelect: (it) => {
				map._userPlugin.$destroy();
console.log('onSelect', geoJSON);
			},
			width: 250, height: 210,
			left: 200, top: 200
		}
	});

};
let getMenu = (type) => {
	switch(type) {
		case 'setUser':
		case 'mapData':
			// if (!map._UserID) return;
			break;
	}
	return menus[type];
};

const menu = (e, it) => {
	let target = e.target,
		type = target.getAttribute('data-key');
	const rect = target.getBoundingClientRect();
console.log('type', type, rect);
	if (type === 'setUser' && !userInfo) {
		userLogin();
console.log('setUser', e.clientX, e.clientY, rect);
		return;
	}
	let items = getMenu(type);	
	if (items) {	
		map._showContextMenu({
			type,
			items,
			x: (rect.x - rect.width / 2), y: rect.height
			// x: e.clientX, y: e.clientY
		});
	}
}
const handleOver = e => {
	if (map.__contextMenu) menu(e);
}
const setLang = lang => {
	window.language = lang;
}

let cont;

</script>

<section bind:this={cont} on:mousedown={save} class="headerCont" on:click|stopPropagation|preventDefault on:mouseover|stopImmediatePropagation|preventDefault on:focus>
    <span class="logo">
	   <img class="headerWidget-logo" src="/img/logotypes/geomixer_transpar_small.svg" alt="" />
    </span>
    <span class="cmdCont" on:mouseover={handleOver} on:focus>
		<button on:click={menu} data-key="mapMenu" class="mapMenu">Карта</button>
		<button on:click={menu} data-key="mapData" class="mapData">Данные</button>
		<button on:click={menu} data-key="mapView" class="mapView">Вид</button>
		<button on:click={menu} data-key="mapInstr" class="mapInstr">Инструменты</button>
		<button on:click={menu} data-key="mapService" class="mapService">Сервисы</button>
		<button on:click={menu} data-key="mapInfo" class="mapInfo">Справка</button>
		<button on:click={menu} data-key="mapLinks" class="mapLinks">Ссылки</button>
    </span>
    <span class="right">
		<span class="lang">
			<button on:click={()=>setLang('rus')} class="">Ru</button>
			<button on:click={()=>setLang('eng')} class="">En</button>
		</span>
		<span class="userPanel">
			<i class="userIcon" />
			<button on:click={menu} on:mouseover={handleOver} data-key="setUser" class="setUser" on:focus>{userInfo?.FullName || 'Войти'}</button>
			{#if userInfo}
			<i class="icon-angle-down" />

			<!--div class="itemDropdown">
				<ul>
					<li class="cab"><span>Личный кабинет</span></li>
					<li class="myMap"><span>Личная карта</span></li>
					<li class="nastr"><span>Системные настройки</span></li>
					<li class="group"><span>Управление группами</span></li>
					<li class="logout"><span>Выйти</span></li>
				</ul>
			</div-->
			{/if}
		</span>
    </span>
</section>

<style>
.headerCont {
    display: flex;
    height: 35px;
    background: #f3f7fa;
    border-bottom: 1px solid #d8e1e8;
/*
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;*/
}
.headerCont .lang button {
	padding: 8px 3px;
}
.headerCont button {
    text-align: center;
    /* color: #000000; */
    font-family: tahoma;
    font-size: 12px;
    font-weight: normal;
    padding: 8px 10px;
    background: transparent;
    outline: none;
    border-radius: unset;
    border: 1px solid transparent;
}
.headerCont span.right {
    right: 16px;
    position: absolute;
	    background: #f3f7fa;
}
.headerCont .userPanel {
	padding-left: 20px;
}
.headerCont .userPanel button.setUser {
	padding: 8px 0;
}
.headerCont .userPanel i.userIcon {
    background-image: url(/img/user.png);
    background-repeat: no-repeat;
    display: inline-block;
	    width: 18px;
    height: 17px;
}

.headerCont i.icon-angle-down:before {
	content: '\';
}

</style>
