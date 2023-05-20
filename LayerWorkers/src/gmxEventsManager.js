import Store from './Store';
import DataService from './DataService';
import Observer from './Observer';

	let hover = {};
	DataService.setHover(hover);
const mousemove = (pars) => {
	const {hostName = 'maps.kosmosnimki.ru'} = pars;
	const hostItem = Store.getHost(hostName);
	if (!hostItem || !hostItem.ids) return new Promise((resolve => resolve));

	const prom = Observer.add({ type: 'mousemove', ...pars}).then(res => {
		let newHover = {};
		const out = {from: pars};
		if (Object.keys(res).length) {
			
			out.items = DataService.sortLayersData(res);
			if (res.items && res.items.length) {
				const item = res.items[0];
				const ids = hostItem.ids[item.layerID];
				const pArr = item.items;
				const layerID = item.layerID;
				const hoverId = pArr[ids.tileAttributeIndexes.gmx_id];
				newHover = {
					layerID,
					hoverId
				};
			} else {
				newHover = {};
			}
			let needScan = hover.layerID !== newHover.layerID || hover.hoverId !== newHover.hoverId;
			hover = newHover;
			DataService.setHover(hover);
// console.log('eventCheck111', needScan, hover, res);
		}
		return out;
	});
	Observer.waitCheckObservers();
	return prom;
};

export default {
	mousemove
};