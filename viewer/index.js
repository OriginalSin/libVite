import './viewer.css';
import Utils from './Utils.js';
import {_userInfo} from './stores.js';
import { _dateInterval } from './stores.js';

import Sidebar from './IconSidebar/index.js';
import Print from './Print/index.js';
import ContextMenu from './ContextMenu/Menu.svelte';
import PopupWindow from './PopupWindow.svelte';

let map;

const init = () => {
	map = L.gmx.gmxMap.leafletMap;

	_userInfo.subscribe(value => {
		map._userInfo = value;
		map._UserID = map._userInfo?.UserID;
	});

	[
		'HeaderWidget',
		'TableAttrs',
		'EditObject',
		'EditLayer'
	].forEach(key => {
		map['_' + key] =  async (attr) => {
			let dynamic = window.gmx.dynamic;
			if (dynamic[key]) {
				let it;
				switch(key) {
					case 'HeaderWidget':
						it = (await import('../dynamic/HeaderWidget.js'));
						break;
					case 'TableAttrs':
						it = (await import('../dynamic/TableAttrs.js'));
						break;
					case 'EditObject':
						it = (await import('../dynamic/EditObject.js'));
						break;
					case 'EditLayer':
						it = (await import('../dynamic/EditLayer.js'));
						break;
				}
				map['_' + key] = it.show;
				map['_' + key + 'Destroy'] = it.destroy;
				if(it.show) it.show(attr);
// console.log('init', key, it);
			}
		}
	});

	map._popupShow = (attr) => {
	// const popupWindow = (attr) => {
	console.log('_popupShow', attr);
		if (map._popupWindow) map._popupWindow.$destroy();
		map._popupWindow = new PopupWindow({
			target: document.body,
			props: {
				attr,
				
			}
		});
	};

	map._showContextMenu = showContextMenu;
	map._setViewerData = setData;

	map._HeaderWidget();
	Sidebar();
// console.log('Sidebar', Sidebar);
	Print();
}
let contextMenu;
const showContextMenu = (data) => {
console.log('showContextMenu', data);
	if (!map._UserID) {
		// Utils.notification.view('Необходимо авторизоваться', 'warn');
		// return;
	}
	if (contextMenu) contextMenu.$destroy();
	contextMenu = new ContextMenu({
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
	showContextMenu,
	setData,
	init
}
