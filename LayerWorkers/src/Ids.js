import LayerWorker from '/LayerWorkers/lworker?worker'

export default class Ids {
	constructor(option) {
		this.id = option.id;			// id слоя
		this.worker = this.setWorker();
		
	}
	// get id() {
		// return this.id;
	// }
	// get worker() {
		// return this.worker;
	// }

	setWorker() {
		const worker = new LayerWorker();
		worker._cmdNum = 0;				// номер посланной команды в worker
		worker._cmdResolver = {};
		worker.onmessage = function(e) {
			const res = e.data || {};
			// console.log('from worker', e.data);
			const num = res.cmdNum;
			const resolver = worker._cmdResolver[num];
			if (resolver) {
				resolver(res);
				delete worker._cmdResolver[num];
			} else console.warn('worker skip:', res);
		}
		return worker;
	}
	sendMessage(data) {
		const worker = this.worker;
console.log('sendMessage', data, worker._cmdResolver);
		const cmdNum = worker._cmdNum++;
		return new Promise(resolve => {
			worker._cmdResolver[cmdNum] = resolve;
			worker.postMessage({...data, cmdNum});
		});
	}

}