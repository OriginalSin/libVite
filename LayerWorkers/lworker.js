import DataManager from './src/DataManager';

self.onmessage = function(e) {
	const message = e.data || {};
	const cmdNum = message.cmdNum;
	const prov = DataManager[message.cmd];
// console.log('onmessage ________________ ', message.cmd);
	// if (prov) prov.call(DataManager, message).then(postMessage);
	if (prov) {
		const promise = prov.call(DataManager, message);
		if (promise instanceof Promise) promise.then(postMessage);
		// else console.warn('skip ', message); 
	}
/*
	// else console.warn('skip ', message); 
	const pars = {...message};
	switch(message.cmd) {
		// case 'moveend': 	ChkVersion.setBbox(pars.attr.mapPos);		break;
		// case 'setDateIntervals': ChkVersion.setDateIntervals(pars);		break;
		// case 'mousemove':
			// let prom = gmxEventsManager.mousemove(pars);
			// if (prom) prom.then(postMessage);
			// break;
		default:
			// if (DataManager[message.cmd]) DataService[message.cmd].call(DataService, pars);
			// else console.warn('skip ', message); 
			break;
	}
	self.postMessage({cmdNum, trs: 'res'});
*/
}
