import './viewer.css';
import LayersTree from './LayersTree/index.js'
import Print from './Print/index.js'
import { _dateInterval } from './stores.js';
import ContextMenu from './ContextMenu/Menu.svelte'
// import TableAttrs from './TableAttrs/Table.svelte'
import TableAttrs from './TableAttrs/index.svelte'
import EditObject from './EditObject/EditObject.svelte';

let map;
const init = () => {
	map = L.gmx.gmxMap.leafletMap;
console.log('init', map);
	map._destroyTableAttrs = destroyTableAttrs;
	map._showTableAttrs = showTableAttrs;
	map._showEditObject = showEditObject;
	map._destroyEditObject = destroyEditObject;
	map._showContextMenu = showContextMenu;
	map._setViewerData = setData;

	// ContextMenu();
	LayersTree();
	Print();
}
let contextMenu;
const showContextMenu = (data) => {
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
const destroyEditObject = (layerID) => {
	if (editObjects[layerID]) editObjects[layerID].$destroy();
}
const showEditObject = (data) => {
	const layerID = data.layerID;
	destroyEditObject(layerID);
	editObjects[layerID] = new EditObject({
		target: document.body,
		  props: {
			  data
		 } 
	});
}

const setData = (data) => {
	if (data.dateInterval) {
		_dateInterval.update(data.dateInterval);
	}
}
export default {
	showEditObject,
	destroyEditObject,
	showTableAttrs,
	destroyTableAttrs,
	showContextMenu,
	setData,
	init
}
