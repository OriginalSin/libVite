import LayerWorker from '/LayerWorkers/lworker?worker'

export default class Ids {
	constructor(option) {
		this.id = option.id;			// id слоя
		this.worker = this.setWorker();
		
	}
	// destructor() {
      // This function is called when the object is destroyed
     // console.log(`${this.id} is destroyed`);
	// }
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
			} else console.warn('worker skip:', num, res);
		}
		return worker;
	}
	sendMessage(data) {
		const worker = this.worker;
		const cmdNum = worker._cmdNum++;
// console.log('sendMessage', data.cmd);
		return new Promise(resolve => {
			worker._cmdResolver[cmdNum] = resolve;
			worker.postMessage({...data, cmdNum});
		});
	}

}