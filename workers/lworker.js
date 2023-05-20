
// SharedWorker.onerror = (event) => {
  // console.error("There is an error with your worker!");
// };
onmessage = function(e) {
	const message = e.data || {};
	const pars = {...message};
// console.log('onmessage ', pars);
/*	switch(message.cmd) {
		case 'getMap':		MapsManager.getMap(message).then(postMessage); break;

		case 'getTiles':
			const attr = message.attr;
			DataService.getTiles(pars).then(queues => {
	// console.log('getTiles ', message, pars, queues);
				// let out = [];
				let out = queues;
				let arr = queues.reduce((a, c) => {
					// delete c.tile;
					// c.items.forEach(it => {
						// delete it.observer;
						// delete it.itemData;

					// });
					// let bitmap = c.bitmap;
					// out.push({key: c.key, bitmap: c.bitmap});
					if (c.bitmap) a.push(c.bitmap);
					return a;
				}, []);
				postMessage({queues: out, z: attr.z, cmdNum: attr.cmdNum}, arr);
			});
			break;
		// case 'getTile':
			// DataService.getTile(pars).then(function(res) {
				// postMessage(res[0]);
			// });
			// break;
		case 'layeradd': 	MapsManager.addSource(pars);				break;
		case 'layerremove': MapsManager.removeSource(pars);				break;
		case 'moveend': 	ChkVersion.setBbox(pars.attr.mapPos);		break;
		case 'setDateIntervals': ChkVersion.setDateIntervals(pars);		break;
		case 'mousemove':
			let prom = gmxEventsManager.mousemove(pars);
			if (prom) prom.then(postMessage);
			break;
		default:
			if (DataService[message.cmd]) DataService[message.cmd].call(DataService, pars);
			// else console.warn('skip ', message); 
			break;
	}
*/
}
