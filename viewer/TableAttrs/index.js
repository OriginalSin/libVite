import './viewer.css';
import LayersTree from './LayersTree/index.js'
import Print from './Print/index.js'
import { _dateInterval } from './stores.js';
import ContextMenu from './ContextMenu/Menu.svelte'
import TableAttrs from './TableAttrs/Table.svelte'
// import EditObject from './EditObject/EditObject.svelte';

const init = () => {
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

// let editObject;
// const showEditObject = (data) => {
	// if (editObject) editObject.$destroy();
	// editObject = new EditObject({
		// target: document.body,
		  // props: {
			  // data
		 // } 
	// });
// }

let tableAttrs;
const showTableAttrs = (data) => {
	if (tableAttrs) tableAttrs.$destroy();
	tableAttrs = new TableAttrs({
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
	// showEditObject,
	showTableAttrs,
	showContextMenu,
	setData,
	init
}
