<script>
import {_userInfo} from './stores.js';
import Utils from './Utils.js';
import UserPlugin from './UserPlugin/UserPlugin.svelte';

export let data;

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
	// await Utils.getJson({cmd, path: 'FileBrowser', pars:{FullName: folder + data.it.Name}});
	// getFolder(folder);
};
const cmdUserInfo = async (cmd, data) => {
console.log('', cmd, data);
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
console.log('Logout', json);
			});

			// arr = await Utils.getJson({cmd: 'Logout', path: 'Handler', ext: '', host:'my.kosmosnimki.ru'});
			// https://
			// my.kosmosnimki.ru/Handler/Logout?callback=gmx_unique_4&0.4928076100872849

			break;
	}
};
let menus = {
	mapMenu: [
		{text: 'Открыть', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Создать', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Сохранить', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Сохранить как', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Экспорт', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Поделиться', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Добавить закладку', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Печать', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Свойства', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Добавить группу', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Права доступа', cmd: 'Open', fn: cmdContextMenu},
	],
	mapData: [
		{text: 'Открыть слой', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Создать слой', cmd: 'Open', items: [
			{text: 'Растровый', cmd: 'Open', fn: cmdContextMenu},
			{text: 'Векторный', cmd: 'Open', fn: cmdContextMenu},
			{text: 'Мультислой', cmd: 'Open', fn: cmdContextMenu},
			{text: 'Виртуальный', cmd: 'Open', fn: cmdContextMenu},
			{text: 'Каталог растров', cmd: 'Open', fn: cmdContextMenu},
			]},
		{text: 'Базовые слои', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Загрузить объекты', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Загрузить фотографии', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Подключить WFS/WMS', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Загрузить растры', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Каталоги растров', cmd: 'Open', fn: cmdContextMenu},
	],
	mapView: [
		{text: 'Дополнительные карты', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Закладки', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Объекты', cmd: 'Open', fn: cmdContextMenu},
	],
	mapInstr: [
		{text: 'Координатная сетка', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Индексная сетка', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Создание буферных зон', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Ручная привязка растров', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Краудсорсинг данных', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Пакетный геокодинг', cmd: 'Open', fn: cmdContextMenu},
		{text: 'Маршруты', cmd: 'Open', fn: cmdContextMenu},
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

const menu = (e, it) => {
	let target = e.target,
		type = target.getAttribute('data-key');
	const rect = target.getBoundingClientRect();
// console.log('ddddd', e.clientX, e.clientY, rect);
	if (type === 'setUser' && !userInfo) {
		userLogin();
console.log('setUser', e.clientX, e.clientY, rect);

return;
	}
	if (menus[type]) {	
		map._showContextMenu({
			items: menus[type],
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
    <span class="lang">
		<button on:click={()=>setLang('rus')} class="">Ru</button>
		<button on:click={()=>setLang('eng')} class="">En</button>
    </span>
    <span class="userPanel">
		<i class="userIcon" />
		<button on:click={menu} on:mouseover={handleOver} data-key="setUser" class="setUser" on:focus>{userInfo?.FullName || 'Войти'}</button>
		{#if userInfo}
		<i class="icon-angle-down" />

		<div class="itemDropdown">
			<ul>
				<li class="cab"><span>Личный кабинет</span></li>
				<li class="myMap"><span>Личная карта</span></li>
				<li class="nastr"><span>Системные настройки</span></li>
				<li class="group"><span>Управление группами</span></li>
				<li class="logout"><span>Выйти</span></li>
			</ul>
		</div>
		{/if}
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
