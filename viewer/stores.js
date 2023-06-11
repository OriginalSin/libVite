import { writable } from 'svelte/store';
// import Notification from './UIComponents/Notification/Notification.js';

// const notification = new Notification();
const day = 24*3600*1000;
const prefix = 'https://maps.kosmosnimki.ru/';
const options = {mode: 'cors', credentials: 'include'};

export const _layerTree = writable({});
export const _dateInterval = writable({}, () => {
	console.log('got a subscriber');
	let now = new Date();
	// var begin = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var begin = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	let end = begin.valueOf() + day - 1000;
	// let dateInterval = { begin, end };
_dateInterval.set({ begin, end });
	// return dateInterval;
});
// export const _notification = writable(notification);
export const _contextMenu = writable({});
export const _userInfo = writable({}, async () => {
	const res = await fetch(prefix + 'User/GetUserInfo.ashx', options).then(resp => resp.json());
	_userInfo.set(res?.Result);
});
export const _drivesInfo = writable([], async () => {
	const res = await fetch(prefix + 'FileBrowser/GetDrives.ashx', options).then(resp => resp.json());
	_drivesInfo.set(res?.Result);
});
