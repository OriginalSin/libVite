import { writable } from 'svelte/store';
// import Notification from './UIComponents/Notification/Notification.js';

// const notification = new Notification();
const day = 24*3600*1000;

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
