// import { writable } from 'svelte/store';
// import Notification from './UIComponents/Notification/Notification.js';

// const notification = new Notification();
const Utils = {
	prefix: 'https://maps.kosmosnimki.ru/',
	// prefix: '/',
	notification: L.gmxUtil.Notification,
	respJson: (resp) => {
		if (resp.status === 200) return resp.json();
		else {
			Utils.notification.view('Серверная ошибка: ' + resp.status, 'error');
		}
	},
	getLayerInfo: layerID => {
		let url = Utils.prefix + 'Layer/GetLayerInfo.ashx';
		return new Promise(resolve => {
			L.gmxUtil.sendCrossDomainPostRequest(url, {LayerName: layerID, WrapStyle: 'message'}, json => {
				let out = json.Result;
				const st = json.Status;
				if (st === 'auth') {
					out = json;
					Utils.notification.view('Серверная ошибка: Необходимо авторизоваться', 'error');
				} else if (st !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					out = json.ErrorInfo;
				}
				resolve(out);
			});
		});
	},
	getLayerJson: (layerID) => {
		const url = Utils.prefix + 'Layer/GetLayerJson.ashx?WrapStyle=none&LayerName=' + layerID;
		return fetch(url)
			.then(Utils.respJson)
			.then(json => {
				if (json.Status !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					return json.ErrorInfo;
				} else {
					return json.Result;
				}
			});
	},
	search: (pars) => {
        const fd = new FormData();
        fd.append('WrapStyle', 'None');
		Object.keys(pars).forEach(k => fd.append(k, pars[k]));
		const url = Utils.prefix + 'VectorLayer/Search.ashx';
		return fetch(url, {method: 'POST', mode: 'cors', credentials: 'include', body: fd})
			.then(Utils.respJson)
			.then(json => {
				if (json.Status !== 'ok') return json.Error;
				const items = json.Result;
				if (typeof(items) === 'number') return items;
				items.indexes = items.fields.reduce((a, c, i) => {
					a[c] = i;
					return a;
				}, {});
				return items;
			});
	}
};

export default Utils;
