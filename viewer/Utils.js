import fetchProgress from 'fetch-progress';

// import { writable } from 'svelte/store';
// import Notification from './UIComponents/Notification/Notification.js';

// const notification = new Notification();
const prefix = 'https://maps.kosmosnimki.ru/';
const options = {mode: 'cors', credentials: 'include'};
const Utils = {
	prefix: 'https://maps.kosmosnimki.ru/',
	// prefix: '/',
	notification: L.gmxUtil.Notification,
	MAX_UPLOAD_SIZE: 500*1024*1024,
	respJson: (resp) => {
		if (resp.status === 200) return resp.json ? resp.json() : JSON.parse(resp.responseText);
		else {
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
	
	fileBrowserReq: (cmd, pars) => {
		let url = prefix + 'FileBrowser/' + cmd + '.ashx?';
		url += Object.keys(pars).map(k => k + '=' + pars[k]).join('&');
		return fetch(url, options)
			.then(Utils.respJson)
			.then(json => {
				if (json.Status === 'auth') {
					Utils.notification.view('Серверная ошибка: Необходимо авторизоваться', 'error');
				} else if (json.Status !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					return json.ErrorInfo;
				} else {
					let ret;
					switch(cmd) {
						case 'CreateFolder':
							ret = json.Status;
							break;
						case 'GetDirectoryContent':
							ret = json.Result.map(it => {
								it.date = new Date(it.Date * 1000).toLocaleString();
								if (it.Size) it.size = Utils.formatBytes(it.Size);
								it.name = it.Name.match(/([^\.]+)/)[0];
								it.type = it.Name.match(/\.([^.]+)$|$/)[1];
								return it;
							});
							break;
					}
					return ret;
				}
			});
	},
	
	createFolder: folder => {
		return Utils.fileBrowserReq('CreateFolder', {FullName: folder});
	},
	
	getDirectoryContent: folder => {
		return Utils.fileBrowserReq('GetDirectoryContent', {root: folder});
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
				if (json.Status !== 'ok') {
					Utils.notification.view('Серверная ошибка: ' + json.ErrorInfo.ErrorMessage, 'error');
					return json.ErrorInfo;
				} else {
					return json.Result;
				}
			});
	},
	upload33: async (files, folder, progressbar) => {
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
		let response = await fetch(url, {method: 'POST', mode: 'cors', credentials: 'include', body: fd})
		const reader = response.body.getReader();

// Шаг 2: получаем длину содержимого ответа
		const contentLength = +response.headers.get('Content-Length');

// Шаг 3: считываем данные:
		let receivedLength = 0; // количество байт, полученных на данный момент
		let chunks = []; // массив полученных двоичных фрагментов (составляющих тело ответа)
		while(true) {
		  const {done, value} = await reader.read();

		  if (done) {
			break;
		  }

		  chunks.push(value);
		  receivedLength += value.length;
			if (progressbar) {
				let p = (receivedLength / contentLength * 100);
				progressbar.style.width = (100 - p) + '%';
			}

		  console.log(`Получено ${receivedLength} из ${contentLength}`)
		}

// Шаг 4: соединим фрагменты в общий типизированный массив Uint8Array
		let chunksAll = new Uint8Array(receivedLength); // (4.1)
		let position = 0;
		for(let chunk of chunks) {
		  chunksAll.set(chunk, position); // (4.2)
		  position += chunk.length;
		}

		// Шаг 5: декодируем Uint8Array обратно в строку
		let result = new TextDecoder("utf-8").decode(chunksAll);

		// Готово!
		if (progressbar) progressbar.style.width = 'unset';
		return JSON.parse(result);
		// alert(commits[0].author.login);
	},
	upload11: (files, folder, progressbar) => {
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
            return false;
        }
        
        fd.append('ParentDir', folder);
		fd.append('WrapStyle', 'None');
		
		const xhr = new XMLHttpRequest();
		if (progressbar) {
			xhr.upload.addEventListener("progress", function(e) {
				let p = (e.loaded / e.total * 100);
				progressbar.style.width = (100 - p) + '%';
			}, false);
		}
		
		xhr.open("POST", Utils.prefix + 'FileBrowser/Upload.ashx');
		xhr.withCredentials = true;
		return new Promise(resolve => {
			xhr.onload = () => {
				if (progressbar) progressbar.style.width = 'unset';
				resolve(Utils.respJson(xhr));
			};
			xhr.send(fd);
		});
	},
	upload_: form => {// ParentDir
		// return fetch(prefix + 'FileBrowser/Upload.ashx', options)
			// .then(Utils.respJson)
			// .then(json => {
			// });
		let url = Utils.prefix + 'FileBrowser/Upload.ashx';
		return new Promise(resolve => {
			L.gmxUtil.sendCrossDomainPostRequest(url, {WrapStyle: 'message'}, json => {
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
			}, form);
		});
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
