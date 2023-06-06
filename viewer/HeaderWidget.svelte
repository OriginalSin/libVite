<script>
import Draggable from '../Modal/Draggable.svelte';
import CreateDescr from './CreateDescr.svelte';

export let data;

let layerID = data.layerID;
let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let layersByID = gmxMap.layersByID;
let props = layersByID[layerID]._gmx.properties;
let attributes = props.attributes;

let closeIcon = L.gmxUtil.setSVGIcon('close');

let gmxDrawing = L.gmx.gmxDrawing;
let features = gmxDrawing.getFeatures();
let geoJSON;
let dialog;

L.gmx.gmxDrawing.on('drawstop', (ev) => {
	features = gmxDrawing.getFeatures();
});
const closeMe = () => {
	map._destroyEditObject(layerID);
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
const save = (ev) => {
console.log('save', ev);
};

console.log('attributes', layerID, data);

let cont;

</script>

<section bind:this={cont} on:mousedown={onMouseDown} class="headerCont">
    <span class="logo">
	   <img class="headerWidget-logo" src="logotypes/geomixer_transpar_small.svg">
    </span>
    <span class="cmdCont">
		<button class="">Карта</button>
		<ul class="map">
			<li>Открыть</li>
			<li>Создать</li>
			<li>Сохранить</li>
			<li>Сохранить как</li>
			<li>Экспорт</li>
			<li>Поделиться</li>
			<li>Добавить закладку</li>
			<li>Печать</li>
			<li>Свойства</li>
			<li>Добавить группу</li>
			<li>Права доступа</li>
		</ul>
		<button class="">Данные</button>
		<ul class="data">
			<li>Открыть слой</li>
			<li>Создать слой</li>
			<ul class="create">
				<li>Растровый</li>
				<li>Векторный</li>
				<li>Мультислой</li>
				<li>Виртуальный</li>
				<li>Каталог растров</li>
			</ul>
			<li>Базовые слои</li>
			<li>Загрузить объекты</li>
			<li>Загрузить фотографии</li>
			<li>Подключить WFS/WMS</li>
			<li>Загрузить растры</li>
			<li>Каталоги растров</li>
		</ul>
		<button class="">Вид</button>
		<ul class="data">
			<li>Дополнительные карты</li>
			<li>Закладки</li>
			<li>Объекты</li>
		</ul>
		<button class="">Инструменты</button>
		<ul class="data">
			<li>Координатная сетка</li>
			<li>Индексная сетка</li>
			<li>Создание буферных зон</li>
			<li>Ручная привязка растров</li>
			<li>Краудсорсинг данных</li>
			<li>Пакетный геокодинг</li>
			<li>Маршруты</li>
		</ul>
		<button class="">Сервисы</button>
		<ul class="data">
			<li>Кадастр Росреестра</li>
		</ul>
		<button class="">Справка</button>
		<ul class="data">
			<li>О проекте/Контакты</li>
			<li>Документация</li>
			<li>GeoMixer API</li>
			<li>Использование плагинов</li>
		</ul>
		<button class="">Ссылки</button>
		<ul class="data">
			<li>Карта пожаров</li>
			<li>Поиск снимков</li>
			<li>Веб-ГИС GeoMixer</li>
		</ul>
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
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
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
