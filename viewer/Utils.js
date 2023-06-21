import fetchProgress from 'fetch-progress';

// import { writable } from 'svelte/store';
// import Notification from './UIComponents/Notification/Notification.js';

// const notification = new Notification();
const prefix = 'https://maps.kosmosnimki.ru/';
const options = {mode: 'cors', credentials: 'include'};
const contentTypes = {
    json: 'application/json',
    form: 'application/x-www-form-urlencoded',
    formData: 'multipart/form-data',
}

const Utils = {
	getUrlEncoded: function(par) {
		return Object.keys(par).map(function(key) { return encodeURIComponent(key) + '=' + encodeURIComponent(par[key]); }).join('&');
	},
	postJson: (attr = {}) => {
		let {pars = {}, opt = {}, path = 'VectorLayer', cmd = 'Search', ext='', type='', host = prefix} = attr;
		let url = host + path + '/' + cmd + ext;
        // let ropt = {...options, method: 'POST', ...opt};
		// if (!pars.WrapStyle) pars.WrapStyle = 'None';
        let body = '';
		if (type === 'form') {
			if (!opt.headers) opt.headers = {
				'Accept': 'application/json',
				'Content-Type': contentTypes[type]
				};
			// ropt.headers = { 'Content-Type': contentTypes[type] };
			body = Utils.getUrlEncoded(pars);
		} else {
			body = new FormData();
					// headers: {'Accept': 'application/json'},
			// if (!opt.headers) opt.headers = {
				// 'Accept': 'application/json'
				// };

			// body.append('WrapStyle', 'None');
			Object.keys(pars).forEach(k => body.append(k, pars[k]));
			// let ropt = {...options, method: 'POST', body: fd, ...opt};
		}
		return fetch(url, {...options, method: 'POST', ...opt, body}) 
		// {method: 'POST', mode: 'cors', credentials: 'include', body: fd}
		// )
			.then(Utils.respJson)
			.then(json => {
				if (json.Status !== 'ok') return json.Error;
				return json.Result;
			});
	},
	// prefix: 'https://maps.kosmosnimki.ru/',
	prefix,
	notification: L.gmxUtil.Notification,
	MAX_UPLOAD_SIZE: 500*1024*1024,
	respJson: (resp) => {
		if (resp.status === 200) {
			let out = '';
			if (resp.json) out = resp.json();
			else if (resp.responseText && resp.responseText.substr(0, 1) === '{') out = JSON.parse(resp.responseText);
			return out;
			// return resp.json ? resp.json() : (resp.responseText.substr(0, 1) === '{' ? JSON.parse(resp.responseText) : '');
		} else {
			Utils.notification.view('Серверная ошибка: ' + resp.status, 'error');
		}
	},
	formatBytes: (bytes, decimals = 2) => {
		if (bytes === 0) {
			return '0';
		} else {
			const k = 1024;
			const dm = decimals < 0 ? 0 : decimals;
			const sizes = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		}
	},

	fileDownload: (cmd, folder, fileName) => {
        const fd = new FormData();
        fd.append('FullName', folder + fileName);
		const url = prefix + 'FileBrowser/' + cmd + '.ashx';
		return fetch(url, {method: 'POST', mode: 'cors', credentials: 'include', body: fd})
			.then(res => res.blob())
			.then(blob => {
				const a = document.createElement("a");
				a.href = window.URL.createObjectURL(blob);
				a.download = fileName;
				a.click();
			});
	},

	upload: (files, folder, progressbar) => {
        let fd = new FormData();
        let tSize = 0;
        for (let f = 0; f < files.length; f++) {
            let file = files[f];
			tSize += file.size;
			fd.append('rawdata', file);
       }
        
        if (tSize > Utils.MAX_UPLOAD_SIZE) {
			Utils.notification.view('Размер файла превышает 500 Мб. Используйте GeoMixerFileBrowser для загрузки больших файлов.', 'error');
           // _this._showWarningDialog();
            return Promise.resolve(false);
        }
        
        fd.append('ParentDir', folder);
		fd.append('WrapStyle', 'None');
		let url = Utils.prefix + 'FileBrowser/Upload.ashx';
		return fetch(url, {method: 'POST', mode: 'cors', credentials: 'include', body: fd})
			.then(
			  fetchProgress({
				// implement onProgress method
				onProgress(progress) {
					if (progressbar) {
						let p = progress.percentage;
						progressbar.style.width = (100 - p) + '%';
					}
						  console.log('hhhhhhh', progress);
				  // A possible progress report you will get
				  // {
				  //    total: 3333,
				  //    transferred: 3333,
				  //    speed: 3333,
				  //    eta: 33,
				  //    percentage: 33
				  //    remaining: 3333,
				  // }
				},
				onError(err) {
					Utils.notification.view('Серверная ошибка: ' + err, 'error');
					console.log(err);
				},
			  })
			)
			.then(Utils.respJson)
			.then(json => {
				if (progressbar) progressbar.style.width = 'unset';
				if (json.Status !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					return json.ErrorInfo;
				} else {
					return json.Result;
				}
			});
	},

	getJson: (attr = {}) => {
		let {pars = {}, opt = {}, path = 'VectorLayer', cmd = 'Search',  ext='.ashx', host = prefix} = attr;
		let url = host + path + '/' + cmd + ext;
		if (!pars.WrapStyle) pars.WrapStyle = 'none';
		url += '?' + Object.keys(pars).map(k => k + '=' + pars[k]).join('&');
		return fetch(url, {...options, ...opt})
			.then(Utils.respJson)
			.then(json => {
				if (Array.isArray(json)) {
					return json;
				} else if (json.Status !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					return json.ErrorInfo;
				} else {
					return json.Result;
				}
			});
	},
	getIndexes: (fields) => {
		return fields.reduce((a, c, i) => {
			a[c] = i;
			return a;
		}, {});
	},
	copyToClipboard: async (txt) => {
		try {
			await navigator.clipboard.writeText(txt);
			//console.log('Content copied to clipboard');
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
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
				items.indexes = Utils.getIndexes(items.fields);
				// items.indexes = items.fields.reduce((a, c, i) => {
					// a[c] = i;
					// return a;
				// }, {});
				return items;
			});
	}
};

export default Utils;
