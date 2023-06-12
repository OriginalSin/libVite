import './viewer.css';
import {_userInfo} from './stores.js';
import LayersTree from './LayersTree/index.js'
import Print from './Print/index.js'
import { _dateInterval } from './stores.js';
import ContextMenu from './ContextMenu/Menu.svelte'
// import TableAttrs from './TableAttrs/Table.svelte'
import TableAttrs from './TableAttrs/index.svelte'
import EditObject from './EditObject/EditObject.svelte';
import EditLayer from './EditLayer/EditLayer.svelte';
import Utils from './Utils.js';

let map;
const init = () => {
	map = L.gmx.gmxMap.leafletMap;

	_userInfo.subscribe(value => {
		map._userInfo = value;
		map._UserID = map._userInfo?.UserID;
	});
console.log('init', map);
	map._showTableAttrs = showTableAttrs;	map._destroyTableAttrs = destroyTableAttrs;
	map._showEditObject = showEditObject;	map._destroyEditObject = destroyEditObject;
	map._showEditLayer = showEditLayer;		map._destroyEditLayer = destroyEditLayer;
	map._showContextMenu = showContextMenu;
	map._setViewerData = setData;

	// ContextMenu();
	LayersTree();
	Print();
}
let contextMenu;
const showContextMenu = (data) => {
	if (!map._UserID) {
		Utils.notification.view('Необходимо авторизоваться', 'warn');
		return;
	}
	if (contextMenu) contextMenu.$destroy();
	contextMenu = new ContextMenu({
		target: document.body,
		  props: {
			  data
		 } 
	});
}

let tableAttrs = {};
const destroyTableAttrs = (layerID) => {
	if (tableAttrs[layerID]) tableAttrs[layerID].$destroy();
}
const showTableAttrs = (data) => {
	const layerID = data.layerID;
	destroyTableAttrs(layerID);
	tableAttrs[layerID] = new TableAttrs({
		target: document.body,
		  props: {
			  layerID
		 } 
	});
}
let editObjects = {};
const destroyEditObject = (key) => { if (editObjects[key]) editObjects[key].$destroy(); }
const showEditObject = (attr) => {
	const {layerID, id} = attr;
	const key = id + '_' + layerID;
	destroyEditObject(key);
	editObjects[key] = new EditObject({target: document.body, props: {attr}});
}

let editLayers = {};
const destroyEditLayer = (layerID) => { if (editLayers[layerID]) editLayers[layerID].$destroy(); }
const showEditLayer = (attr) => {
	const {layerID} = attr;
	if (!attr.width) attr.width = 380;
	destroyEditLayer(layerID);
	editLayers[layerID] = new EditLayer({target: document.body, props: {attr}});
}
const setData = (data) => {
	if (data.dateInterval) {
		_dateInterval.update(data.dateInterval);
	}
}
export default {
	showEditLayer,	destroyEditLayer,
	showEditObject,	destroyEditObject,
	showTableAttrs,	destroyTableAttrs,
	showContextMenu,
	setData,
	init
}
