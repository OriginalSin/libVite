<script>
// import Draggable from '../Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';

export let data;

let gmxMap = L.gmx.gmxMap,
	map = gmxMap.leafletMap;

const save = (ev) => {
console.log('save', ev);
};
const cmdContextMenu = async (cmd, data) => {
console.log('cmdContextMenu', cmd, data);
	// await Utils.getJson({cmd, path: 'FileBrowser', pars:{FullName: folder + data.it.Name}});
	// getFolder(folder);
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
};

const menu = (e, it) => {
	let target = e.target,
		type = target.getAttribute('data-key');
	const rect = target.getBoundingClientRect();
// console.log('ddddd', e.clientX, e.clientY, rect);
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

let cont;

</script>

<section bind:this={cont} on:mousedown={save} class="headerCont">
    <span class="logo">
	   <img class="headerWidget-logo" src="/img/logotypes/geomixer_transpar_small.svg">
    </span>
    <span class="cmdCont" on:mouseover|stopImmediatePropagation|preventDefault={handleOver}>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapMenu" class="mapMenu">Карта</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapData" class="mapData">Данные</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapView" class="mapView">Вид</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapInstr" class="mapInstr">Инструменты</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapService" class="mapService">Сервисы</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapInfo" class="mapInfo">Справка</button>
		<button on:click|stopPropagation|preventDefault={menu} data-key="mapLinks" class="mapLinks">Ссылки</button>
    </span>
    <span class="lang">
		<button class="">Ru</button>
		<button class="">En</button>
    </span>
    <span class="userPanel">
		<i class="userIcon" />
		<span>Сергей Алексеев</span>
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
.headerCont .cmdCont button {
    text-align: center;
    /* color: #000000; */
    font-family: tahoma;
    font-size: 12px;
    font-weight: normal;
    padding: 8px 10px 8px 10px;
    background: transparent;
    outline: none;
    border-radius: unset;
    border: 1px solid transparent;
}
.headerCont i.userPanel {
    background-image: url(/img/user.png);
    background-repeat: no-repeat;
    display: inline-block;
}
.ui-icon, .ui-widget-content .ui-icon {
    background-image: url(/img/ui-icons_444444_256x240.png);
}
.ui-icon-newwin {
    background-position: -48px -80px;
}
.ui-icon {
    width: 16px;
    height: 16px;
}
.ui-icon {
    display: block;
    text-indent: -99999px;
    overflow: hidden;
    background-repeat: no-repeat;
}
.headerCont i.icon-angle-down:before {
    content: '\';
}
</style>
